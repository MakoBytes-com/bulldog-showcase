/**
 * Daily Texas new-business-permits scraper.
 *
 * Pulls the data.texas.gov "New Sales Tax Permits issued last 7 days"
 * dataset, filters to Bulldog's Houston-area service zips, and
 * upserts each outlet as a sales_leads row with source='business-filing'.
 *
 * Address comes built into the dataset — no HCAD enrichment needed.
 *
 * Auth: x-vercel-cron header OR Bearer CRON_SECRET.
 */

import { NextResponse } from "next/server";

import { db, schema } from "@/lib/db";
import { recordCronRun } from "@/lib/db/cronRuns";
import { logError } from "@/lib/log";
import { fetchTexasNewPermits } from "@/lib/scrapers/texasSalesPermits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  // Look back 14 days so we catch any backfills the dataset publishes
  // late. The dataset name says "last 7 days" but in practice rows
  // sometimes land 2-3 days after the actual permit date.
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 14);

  const startedAt = new Date();
  try {
    const permits = await fetchTexasNewPermits({ since });

    let inserted = 0;
    let skippedDuplicate = 0;

    for (const p of permits) {
      // Composite external_id: a single business can have many outlets,
      // each with its own permit. Dedupe per outlet.
      const externalId = `tx-stp-${p.taxpayerNumber}-${p.outletNumber}`;

      const result = await db
        .insert(schema.salesLeads)
        .values({
          source: "business-filing",
          externalId,
          name: p.outletName || p.taxpayerName,
          address: p.address,
          city: p.city,
          state: p.state,
          zip: p.zip,
          metadata: {
            taxpayerName: p.taxpayerName,
            taxpayerNumber: p.taxpayerNumber,
            outletNumber: p.outletNumber,
            permitIssueDate: p.permitIssueDate,
            firstSalesDate: p.firstSalesDate,
            countyCode: p.countyCode,
            source: "Texas Comptroller — New Sales Tax Permits",
            sourceUrl: "https://data.texas.gov/Government-and-Taxes/New-Sales-Tax-Permits-issued-last-7-days/np34-wmxb",
          },
          status: "new",
          consentToCall: false,
          dncFlagged: false,
          internalDoNotContact: false,
        })
        .onConflictDoNothing({
          target: [schema.salesLeads.source, schema.salesLeads.externalId],
        })
        .returning({ id: schema.salesLeads.id });

      if (result.length > 0) inserted++;
      else skippedDuplicate++;
    }

    await recordCronRun({
      name: "scrape-tx-permits",
      status: "ok",
      startedAt,
      rawCount: permits.length,
      insertedCount: inserted,
      detail: { skippedDuplicate, since: since.toISOString().slice(0, 10) },
    });

    return NextResponse.json({
      ok: true,
      since: since.toISOString().slice(0, 10),
      raw: permits.length,
      inserted,
      skippedDuplicate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    await recordCronRun({
      name: "scrape-tx-permits",
      status: "error",
      startedAt,
      errorMessage: message,
    });
    logError("cron/scrape-tx-permits", "scrape failed", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
