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
  return db
    .select()
    .from(schema.salesLeads)
    .where(and(eq(schema.salesLeads.source, source), HAS_ADDRESS))
    .orderBy(desc(schema.salesLeads.scrapedAt))
    .limit(limit);
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
  const rows = await db
    .select({
      source: schema.salesLeads.source,
      status: schema.salesLeads.status,
      withAddress: sql<number>`count(*) filter (where address ~ '^[0-9]')::int`,
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
