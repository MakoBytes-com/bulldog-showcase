/**
 * Sales-pipeline queries. Kept separate from db/queries.ts so the
 * sales subsystem is easy to find and extend.
 */

import { and, desc, eq, ne, sql } from "drizzle-orm";

import { db, schema } from "./index";

export async function listLeadsBySource(
  source: "home-sale" | "business-filing",
  limit = 100,
) {
  return db
    .select()
    .from(schema.salesLeads)
    .where(eq(schema.salesLeads.source, source))
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
      n: sql<number>`count(*)::int`,
    })
    .from(schema.salesLeads)
    .groupBy(schema.salesLeads.source, schema.salesLeads.status);

  // Pivot: { 'home-sale': { new: 12, saved: 3, ... }, 'business-filing': {...} }
  const byKey: Record<string, Record<string, number>> = {
    "home-sale": {},
    "business-filing": {},
  };
  let total = 0;
  for (const r of rows) {
    if (!byKey[r.source]) byKey[r.source] = {};
    byKey[r.source][r.status] = r.n;
    total += r.n;
  }
  return { byKey, total };
}
