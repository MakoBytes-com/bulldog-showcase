/**
 * Sales-pipeline queries. Kept separate from db/queries.ts so the
 * sales subsystem is easy to find and extend.
 */

import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm";

import { db, schema } from "./index";

// Address-having predicate: street address must start with a digit.
// Anything without a real address is hidden from the panel — it stays
// in the DB so daily HCAD re-enrichment can resolve it later, but the
// sales team only sees actionable rows.
const HAS_ADDRESS = sql`${schema.salesLeads.address} ~ '^[0-9]'`;

export async function listLeadsBySource(
  source: "home-sale" | "business-filing",
  limit = 100,
) {
  // Pull more than `limit` raw rows so that after collapsing duplicate
  // addresses we still have ~limit distinct mailable leads.
  const raw = await db
    .select()
    .from(schema.salesLeads)
    .where(and(eq(schema.salesLeads.source, source), HAS_ADDRESS))
    .orderBy(desc(schema.salesLeads.scrapedAt))
    .limit(limit * 3);

  // Collapse by mailing address — multiple deeds can land on the same
  // property in the same window (corrective deed, related parcel,
  // refinance, etc). Each row is a real Clerk filing but for mail
  // purposes one postcard per address is what matters. Keep the most
  // recently scraped row per address (it'll be the first hit since
  // the SELECT was ordered by scrapedAt DESC).
  const seen = new Set<string>();
  const out: typeof raw = [];
  for (const lead of raw) {
    const key = (lead.address ?? "").toUpperCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(lead);
    if (out.length >= limit) break;
  }
  return out;
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
