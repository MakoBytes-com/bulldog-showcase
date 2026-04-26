/**
 * Daily Harris County deed scraper.
 *
 * Cron-triggered (vercel.json). Walks the past 5 calendar days so we
 * catch any records the Clerk's index didn't have on yesterday's run
 * (typical lag is 1-2 business days). Dedupe is enforced by a unique
 * index on (source, external_id) in the salesLeads table — every
 * fileNumber writes once across all reruns.
 *
 * Auth: requires either Vercel's x-vercel-cron header (set by Vercel
 * cron natively) OR a Bearer CRON_SECRET match for manual triggering.
 */

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { logError, logWarn } from "@/lib/log";
import {
  scrapeHarrisCountyDeeds,
  looksLikeResidentialSale,
  type DeedRecord,
} from "@/lib/scrapers/harrisCounty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: Request): boolean {
  if (req.headers.get("x-vercel-cron") !== null) return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

function looksLikePersonName(name: string): boolean {
  // Two-or-more uppercase tokens, no commas-only structure, no all-digits.
  if (!name) return false;
  if (/^\d+/.test(name)) return false;
  const tokens = name.trim().split(/\s+/);
  return tokens.length >= 2 && tokens.length <= 6;
}

function nameForLead(rec: DeedRecord): string {
  // Prefer the FIRST grantee that looks like a person name.
  for (const name of rec.grantee) {
    if (looksLikePersonName(name)) return name;
  }
  return rec.grantee[0] ?? "";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setUTCDate(today.getUTCDate() - 5);
  const toDate = new Date(today);
  toDate.setUTCDate(today.getUTCDate() - 1); // exclude today (rarely indexed yet)

  try {
    const { records, bytes, elapsedMs } = await scrapeHarrisCountyDeeds({
      fromDate,
      toDate,
    });

    let inserted = 0;
    let skippedDuplicate = 0;
    let skippedFiltered = 0;

    for (const rec of records) {
      if (!looksLikeResidentialSale(rec)) {
        skippedFiltered++;
        continue;
      }
      const name = nameForLead(rec);
      if (!name) {
        skippedFiltered++;
        continue;
      }

      const clerkMetadata = {
        fileDate: rec.fileDate,
        type: rec.type,
        pages: rec.pages,
        grantor: rec.grantor,
        grantee: rec.grantee,
        description: rec.description,
        section: rec.section,
        lot: rec.lot,
        block: rec.block,
        abstract: rec.abstract,
        tract: rec.tract,
        unit: rec.unit,
        reserve: rec.reserve,
        outlot: rec.outlot,
        countyClerk: "Harris County",
        sourceUrl: `https://www.cclerk.hctx.net/applications/websearch/RP_R.aspx`,
      };

      // ON CONFLICT, refresh the metadata only — preserve everything
      // else (status, notes, address from prior enrichment). Lets us
      // re-scrape after a parser improvement and immediately have the
      // richer legal-description fields on existing rows without
      // creating duplicates.
      const result = await db
        .insert(schema.salesLeads)
        .values({
          source: "home-sale",
          externalId: rec.fileNumber,
          name,
          address: null, // address comes from HCAD enrichment
          city: "Houston",
          state: "TX",
          zip: null,
          metadata: clerkMetadata,
          status: "new",
          consentToCall: false,
          dncFlagged: false,
          internalDoNotContact: false,
        })
        .onConflictDoUpdate({
          target: [schema.salesLeads.source, schema.salesLeads.externalId],
          set: {
            // jsonb || jsonb merges right-side keys on top of left, so
            // existing keys (e.g. metadata.hcad set by the enrichment
            // job) are preserved when the right-side doesn't supply
            // them. Re-scrapes refresh the Clerk-side fields without
            // wiping HCAD enrichment.
            metadata: sql`coalesce(${schema.salesLeads.metadata}, '{}'::jsonb) || ${JSON.stringify(clerkMetadata)}::jsonb`,
          },
        })
        .returning({ id: schema.salesLeads.id });

      if (result.length > 0) {
        inserted++;
      } else {
        skippedDuplicate++;
      }
    }

    return NextResponse.json({
      ok: true,
      window: {
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
      },
      raw: records.length,
      inserted,
      skippedDuplicate,
      skippedFiltered,
      bytes,
      elapsedMs,
    });
  } catch (err) {
    logError("cron/scrape-harris", "scrape failed", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
