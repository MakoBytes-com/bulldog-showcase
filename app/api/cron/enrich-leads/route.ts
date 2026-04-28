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
import { recordCronRun } from "@/lib/db/cronRuns";
import { logError, logWarn } from "@/lib/log";
import { enrichLead } from "@/lib/scrapers/hcadEnrich";

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

  const startedAt = new Date();

  try {
  // Pull leads that need enrichment OR re-enrichment:
  //   1. Address is null / not street-formatted (unresolved)
  //   2. Address is fine but metadata.hcad.apprVal is missing
  //      (resolved before we started capturing property value)
  const candidates = await db
    .select()
    .from(schema.salesLeads)
    .where(
      and(
        eq(schema.salesLeads.source, "home-sale"),
        or(
          isNull(schema.salesLeads.address),
          sql`${schema.salesLeads.address} !~ '^[0-9]'`,
          sql`(metadata->'hcad'->>'apprVal') IS NULL`,
        ),
      ),
    )
    .limit(MAX_PER_RUN);

  let enriched = 0;
  let stillUnknown = 0;
  let errors = 0;
  const errorSamples: string[] = [];

  for (const lead of candidates) {
    const meta = (lead.metadata ?? {}) as Record<string, unknown>;
    const grantees = Array.isArray(meta.grantee) ? (meta.grantee as string[]) : [lead.name];
    const subdivision = typeof meta.description === "string" ? meta.description : null;
    const lot = typeof meta.lot === "string" ? meta.lot : null;
    const block = typeof meta.block === "string" ? meta.block : null;

    try {
      const parcel = await enrichLead({ grantees, subdivision, lot, block });

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
              apprVal: parcel.apprVal,
              mktVal: parcel.mktVal,
              matchSource: parcel.matchSource,
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

  await recordCronRun({
    name: "enrich-leads",
    status: "ok",
    startedAt,
    rawCount: candidates.length,
    insertedCount: enriched, // # of leads that gained new address/value
    detail: { stillUnknown, errors, errorSamples },
  });

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    enriched,
    stillUnknown,
    errors,
    errorSamples,
  });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    await recordCronRun({
      name: "enrich-leads",
      status: "error",
      startedAt,
      errorMessage: message,
    });
    logError("cron/enrich-leads", "enrich failed", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
