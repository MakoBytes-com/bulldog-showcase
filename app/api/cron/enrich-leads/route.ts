/**
 * Daily lead-address enrichment.
 *
 * Picks up every sales_leads row that doesn't yet have a street
 * address, looks it up in HCAD's public ArcGIS Parcels layer by owner
 * name, and writes the address back. HCAD lags the deed filings by
 * ~30-90 days in the worst case, so this is run daily and old leads
 * stay in the queue until HCAD catches up to them.
 *
 * Auth: Vercel cron native OR Bearer CRON_SECRET.
 */

import { NextResponse } from "next/server";
import { and, eq, isNull, or, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { logError, logWarn } from "@/lib/log";
import { enrichLeadFromHcad } from "@/lib/scrapers/hcadEnrich";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cap per run so we stay under the 60s function budget. Each HCAD call
// is ~150-300ms; 80 lookups ≈ 12-24s, leaves headroom for DB writes.
const MAX_PER_RUN = 80;

function isAuthorized(req: Request): boolean {
  if (req.headers.get("x-vercel-cron") !== null) return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Pull leads that need enrichment: home-sale source, no street-style
  // address yet (we treat the descriptions stored as address as a
  // placeholder — if it doesn't contain a digit, it's not a street).
  const candidates = await db
    .select()
    .from(schema.salesLeads)
    .where(
      and(
        eq(schema.salesLeads.source, "home-sale"),
        or(
          isNull(schema.salesLeads.address),
          // No leading digit = not a street address
          sql`${schema.salesLeads.address} !~ '^[0-9]'`,
        ),
      ),
    )
    .limit(MAX_PER_RUN);

  let enriched = 0;
  let stillUnknown = 0;
  let errors = 0;
  const errorSamples: string[] = [];

  for (const lead of candidates) {
    // Subdivision hint sits on the original metadata.description from
    // the Clerk row — we stored that as the placeholder address.
    const subdivisionHint =
      typeof lead.metadata === "object" &&
      lead.metadata !== null &&
      "description" in lead.metadata
        ? (lead.metadata as { description?: string }).description ?? null
        : lead.address;

    try {
      const parcel = await enrichLeadFromHcad(lead.name, subdivisionHint);

      if (!parcel) {
        stillUnknown++;
        continue;
      }

      await db
        .update(schema.salesLeads)
        .set({
          address: parcel.address,
          city: parcel.city ?? lead.city,
          zip: parcel.zip ?? null,
          // Preserve original Clerk metadata; layer HCAD on top.
          metadata: {
            ...(typeof lead.metadata === "object" && lead.metadata !== null
              ? lead.metadata
              : {}),
            hcad: {
              hcadNum: parcel.hcadNum,
              currentOwner: parcel.owner,
              subdivision: parcel.subdivision,
              enrichedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date(),
        })
        .where(eq(schema.salesLeads.id, lead.id));

      enriched++;
    } catch (err) {
      errors++;
      const msg = err instanceof Error ? err.message : String(err);
      if (errorSamples.length < 3) errorSamples.push(`${lead.name}: ${msg}`);
      logWarn("cron/enrich-leads", `lookup failed for lead ${lead.id}`, {
        name: lead.name,
        err: msg,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    enriched,
    stillUnknown,
    errors,
    errorSamples,
  });
}
