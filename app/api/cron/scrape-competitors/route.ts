/**
 * Weekly competitor BBB-stats refresher. Walks the COMPETITOR_SEED
 * list, fetches each BBB profile, upserts the latest stats. Cron runs
 * weekly because BBB ratings change slowly.
 */

import { NextResponse } from "next/server";

import { db, schema } from "@/lib/db";
import { logError, logWarn } from "@/lib/log";
import {
  COMPETITOR_SEED,
  fetchBbbComplaints,
  fetchBbbStats,
} from "@/lib/scrapers/bbbProfile";

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

  const results: Array<{ slug: string; ok: boolean; err?: string; newComplaints?: number }> = [];

  for (const c of COMPETITOR_SEED) {
    try {
      const stats = await fetchBbbStats(c.bbbUrl);
      await db
        .insert(schema.competitorIntel)
        .values({
          slug: c.slug,
          name: c.name,
          bbbUrl: c.bbbUrl,
          bbbRating: stats.bbbRating,
          bbbAccredited: stats.bbbAccredited,
          accreditedSince: stats.accreditedSince,
          totalComplaints: stats.totalComplaints,
          totalReviews: stats.totalReviews,
          averageReviewRating: stats.averageReviewRating?.toString() ?? null,
          yearsInBusiness: stats.yearsInBusiness,
          scrapedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.competitorIntel.slug,
          set: {
            name: c.name,
            bbbUrl: c.bbbUrl,
            bbbRating: stats.bbbRating,
            bbbAccredited: stats.bbbAccredited,
            accreditedSince: stats.accreditedSince,
            totalComplaints: stats.totalComplaints,
            totalReviews: stats.totalReviews,
            averageReviewRating: stats.averageReviewRating?.toString() ?? null,
            yearsInBusiness: stats.yearsInBusiness,
            scrapedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      // Now pull recent complaints for this competitor.
      let newComplaints = 0;
      try {
        const complaints = await fetchBbbComplaints(c.bbbUrl);
        for (const cmp of complaints) {
          const inserted = await db
            .insert(schema.competitorComplaints)
            .values({
              competitorSlug: c.slug,
              bodyHash: cmp.bodyHash,
              filedDate: cmp.filedDate,
              complaintType: cmp.complaintType,
              status: cmp.status,
              body: cmp.body,
            })
            .onConflictDoNothing({
              target: [
                schema.competitorComplaints.competitorSlug,
                schema.competitorComplaints.bodyHash,
              ],
            })
            .returning({ id: schema.competitorComplaints.id });
          if (inserted.length > 0) newComplaints++;
        }
      } catch (err) {
        // Don't fail the whole competitor if just complaints fetch fails;
        // the headline stats already landed above.
        logWarn("cron/scrape-competitors", `complaints fetch failed for ${c.slug}`, {
          err: err instanceof Error ? err.message : String(err),
        });
      }

      results.push({ slug: c.slug, ok: true, newComplaints });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ slug: c.slug, ok: false, err: msg });
      logWarn("cron/scrape-competitors", `failed ${c.slug}`, { err: msg });
    }
  }

  return NextResponse.json({
    ok: true,
    competitors: results.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
