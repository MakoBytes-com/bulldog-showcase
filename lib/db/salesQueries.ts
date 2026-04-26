/**
 * Sales-pipeline queries. Kept separate from db/queries.ts so the
 * sales subsystem is easy to find and extend.
 */

import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm";

import { db, schema } from "./index";
import { scoreLead } from "@/lib/leadScoring";
import type { SalesLead } from "@/lib/db/schema";

// Address-having predicate: street address must start with a digit.
// Anything without a real address is hidden from the panel — it stays
// in the DB so daily HCAD re-enrichment can resolve it later, but the
// sales team only sees actionable rows.
const HAS_ADDRESS = sql`${schema.salesLeads.address} ~ '^[0-9]'`;

export type SortKey = "score" | "value" | "date";

export type LeadsPage = {
  leads: typeof schema.salesLeads.$inferSelect[];
  page: number;
  perPage: number;
  totalDistinct: number;
  totalPages: number;
  sort: SortKey;
};

const PER_PAGE = 100;

function apprValOf(lead: SalesLead): number {
  const meta = (lead.metadata ?? {}) as Record<string, unknown>;
  const hcad = (meta.hcad ?? {}) as Record<string, unknown>;
  return typeof hcad.apprVal === "number" ? hcad.apprVal : -1;
}

export async function listLeadsBySource(
  source: "home-sale" | "business-filing",
  page = 1,
  filters: { minValue?: number; sort?: SortKey } = {},
): Promise<LeadsPage> {
  const safePage = Math.max(1, Math.floor(page));
  const minValue = filters.minValue && filters.minValue > 0 ? filters.minValue : 0;
  // Default sort differs per source: home-sale defaults to score (the
  // intelligent ranking), business-filing defaults to date (freshness
  // is already most of the score for that source).
  const sort: SortKey =
    filters.sort ?? (source === "home-sale" ? "score" : "date");

  // Pull ALL address-having rows for this source, then collapse
  // duplicates (multiple filings on the same property), then paginate
  // the deduplicated set. Done in JS because the dedupe is by
  // UPPER(address) which doesn't index cleanly with offset/limit.
  // Property-value filter applied as an extra JSON predicate.
  const conditions = [eq(schema.salesLeads.source, source), HAS_ADDRESS];
  if (source === "home-sale" && minValue > 0) {
    conditions.push(
      sql`((metadata->'hcad'->>'apprVal')::numeric >= ${minValue})`,
    );
  }

  const rawList = await db
    .select()
    .from(schema.salesLeads)
    .where(and(...conditions))
    .orderBy(desc(schema.salesLeads.scrapedAt));

  const seen = new Set<string>();
  const deduped: typeof rawList = [];
  for (const lead of rawList) {
    const key = (lead.address ?? "").toUpperCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(lead);
  }

  // Sort the deduplicated set. Score and value sorts only make sense
  // for home-sale (HCAD enrichment is the differentiator); date is
  // already the input order so it's a no-op.
  if (source === "home-sale" && sort === "score") {
    const withScore = deduped.map((l) => ({ l, s: scoreLead(l).total }));
    withScore.sort((a, b) => b.s - a.s);
    deduped.length = 0;
    deduped.push(...withScore.map((x) => x.l));
  } else if (source === "home-sale" && sort === "value") {
    deduped.sort((a, b) => apprValOf(b) - apprValOf(a));
  }

  const totalDistinct = deduped.length;
  const totalPages = Math.max(1, Math.ceil(totalDistinct / PER_PAGE));
  const start = (safePage - 1) * PER_PAGE;
  const end = start + PER_PAGE;

  return {
    leads: deduped.slice(start, end),
    page: safePage,
    perPage: PER_PAGE,
    totalDistinct,
    totalPages,
    sort,
  };
}

/** Saved + active workflow leads. Excludes 'new' (not yet triaged) and
 * 'dead' (closed unsuccessfully) so the saved-leads tab stays focused
 * on what the sales team is actively working. */
export async function listActiveLeads(limit = 200) {
  return db
    .select()
    .from(schema.salesLeads)
    .where(
      and(
        ne(schema.salesLeads.status, "new"),
        ne(schema.salesLeads.status, "dead"),
      ),
    )
    .orderBy(desc(schema.salesLeads.updatedAt))
    .limit(limit);
}

export async function getPipelineFreshness() {
  // Most-recent scraped_at per source. Tells the user whether the
  // pipeline is alive or stale.
  const rows = await db
    .select({
      source: schema.salesLeads.source,
      lastScraped: sql<Date | null>`max(${schema.salesLeads.scrapedAt})`,
    })
    .from(schema.salesLeads)
    .groupBy(schema.salesLeads.source);

  const competitor = await db
    .select({
      lastScraped: sql<Date | null>`max(${schema.competitorIntel.scrapedAt})`,
    })
    .from(schema.competitorIntel);

  const out: Record<string, Date | null> = {
    "home-sale": null,
    "business-filing": null,
    competitor: competitor[0]?.lastScraped ?? null,
  };
  for (const r of rows) {
    out[r.source] = r.lastScraped;
  }
  return out;
}

export async function getLeadCounts() {
  // Count distinct addresses (not raw rows) so the overview matches
  // what the list view shows after duplicate-address collapsing.
  const rows = await db
    .select({
      source: schema.salesLeads.source,
      status: schema.salesLeads.status,
      withAddress: sql<number>`count(distinct upper(address)) filter (where address ~ '^[0-9]')::int`,
      pending: sql<number>`count(*) filter (where address is null or address !~ '^[0-9]')::int`,
    })
    .from(schema.salesLeads)
    .groupBy(schema.salesLeads.source, schema.salesLeads.status);

  // Pivot: { 'home-sale': { new: 12, saved: 3, ... }, 'business-filing': {...} }
  const byKey: Record<string, Record<string, number>> = {
    "home-sale": {},
    "business-filing": {},
  };
  const pendingByKey: Record<string, number> = {};
  let total = 0;
  let pendingTotal = 0;
  for (const r of rows) {
    if (!byKey[r.source]) byKey[r.source] = {};
    byKey[r.source][r.status] = (byKey[r.source][r.status] ?? 0) + r.withAddress;
    pendingByKey[r.source] = (pendingByKey[r.source] ?? 0) + r.pending;
    total += r.withAddress;
    pendingTotal += r.pending;
  }
  return { byKey, pendingByKey, total, pendingTotal };
}
