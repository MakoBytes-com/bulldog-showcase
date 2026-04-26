/**
 * Lead scoring (1-10) for the sales pipeline. Higher = better
 * prospect to call/mail first.
 *
 * Deterministic, computed at render time from data already in the
 * lead row. No machine learning, no opaque magic — every component
 * is auditable and tunable here.
 *
 * Score breakdown for home-sales (max 10):
 *   - Property value (0-5)   high HCAD apprVal = premium prospect
 *   - Match confidence (0-2) owner-name match > subdivision-only
 *   - Freshness (0-3)        days since deed filing
 *
 * Score breakdown for business-filings (max 10):
 *   - Source quality (5)     all permits come with an address = +5 base
 *   - Freshness (0-5)        days since permit issued
 *
 * Internal DNC = always 0 (don't waste time on don't-contact rows).
 */

import type { SalesLead } from "@/lib/db/schema";

export type ScoreBreakdown = {
  total: number; // 0-10, integer
  components: { label: string; value: number; reason: string }[];
};

function scoreValue(appr: number | null): { v: number; r: string } {
  if (appr == null) return { v: 0, r: "no HCAD value yet" };
  if (appr >= 1_000_000) return { v: 5, r: "$1M+ home" };
  if (appr >= 500_000) return { v: 4, r: "$500K-$1M" };
  if (appr >= 350_000) return { v: 3, r: "$350K-$500K" };
  if (appr >= 250_000) return { v: 2, r: "$250K-$350K" };
  if (appr >= 150_000) return { v: 1, r: "$150K-$250K" };
  return { v: 0, r: "<$150K" };
}

function scoreFreshness(
  filedDateStr: string | null,
  maxPoints: number,
): { v: number; r: string } {
  if (!filedDateStr) return { v: 0, r: "no filing date" };
  // Accept MM/DD/YYYY (Clerk format) or YYYY-MM-DD (Comptroller format).
  let d: Date | null = null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(filedDateStr)) {
    const [m, day, y] = filedDateStr.split("/").map(Number);
    d = new Date(Date.UTC(y, m - 1, day));
  } else if (/^\d{4}-\d{2}-\d{2}/.test(filedDateStr)) {
    d = new Date(filedDateStr);
  }
  if (!d || Number.isNaN(d.getTime())) return { v: 0, r: "bad date" };
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 7) return { v: maxPoints, r: `${days}d old (fresh)` };
  if (days <= 14) return { v: Math.round(maxPoints * 0.75), r: `${days}d old` };
  if (days <= 30) return { v: Math.round(maxPoints * 0.5), r: `${days}d old` };
  if (days <= 60) return { v: Math.round(maxPoints * 0.25), r: `${days}d old` };
  return { v: 0, r: `${days}d old (stale)` };
}

export function scoreLead(lead: SalesLead): ScoreBreakdown {
  if (lead.internalDoNotContact) {
    return {
      total: 0,
      components: [{ label: "DNC", value: 0, reason: "Internal Do-Not-Contact" }],
    };
  }

  const meta = (lead.metadata ?? {}) as Record<string, unknown>;
  const components: ScoreBreakdown["components"] = [];

  if (lead.source === "home-sale") {
    const hcad = (meta.hcad ?? {}) as Record<string, unknown>;
    const appr = typeof hcad.apprVal === "number" ? hcad.apprVal : null;
    const matchSrc = typeof hcad.matchSource === "string" ? hcad.matchSource : null;
    const filed = typeof meta.fileDate === "string" ? meta.fileDate : null;

    const v = scoreValue(appr);
    components.push({ label: "Value", value: v.v, reason: v.r });

    if (matchSrc === "owner-name")
      components.push({ label: "Match", value: 2, reason: "Owner-name match (high)" });
    else if (matchSrc === "legal-description")
      components.push({ label: "Match", value: 1, reason: "Subdivision+lot match" });
    else
      components.push({ label: "Match", value: 0, reason: "no HCAD enrichment" });

    const f = scoreFreshness(filed, 3);
    components.push({ label: "Freshness", value: f.v, reason: f.r });
  } else {
    components.push({
      label: "Source",
      value: 5,
      reason: "Address-confirmed at filing time",
    });
    const filed =
      typeof meta.permitIssueDate === "string" ? meta.permitIssueDate : null;
    const f = scoreFreshness(filed, 5);
    components.push({ label: "Freshness", value: f.v, reason: f.r });
  }

  const total = components.reduce((s, c) => s + c.value, 0);
  return { total: Math.min(10, Math.max(0, total)), components };
}
