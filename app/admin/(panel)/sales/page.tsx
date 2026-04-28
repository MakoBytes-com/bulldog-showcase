import Link from "next/link";

import { Card } from "../../_components/ui";
import { getLeadCounts, getPipelineFreshness } from "@/lib/db/salesQueries";
import type { CronStatusRow } from "@/lib/db/cronRuns";
import { fetchScrapingBeeUsage } from "@/lib/scrapers/scrapingBeeUsage";

export const dynamic = "force-dynamic";

function sourceTotal(by: Record<string, number> | undefined) {
  if (!by) return 0;
  return Object.values(by).reduce((s, n) => s + n, 0);
}

function relativeTime(d: Date): string {
  const ageMs = Date.now() - d.getTime();
  const min = Math.floor(ageMs / 60_000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
}

type Health = "healthy" | "stale" | "errored" | "never";

function classifyRun(
  run: CronStatusRow | null,
  staleMs: number,
): { health: Health; ageText: string; ageMs: number } {
  if (!run) return { health: "never", ageText: "never", ageMs: Infinity };
  const ageMs = Date.now() - run.lastRunAt.getTime();
  const ageText = relativeTime(run.lastRunAt);
  if (run.status === "error") return { health: "errored", ageText, ageMs };
  if (ageMs > staleMs) return { health: "stale", ageText, ageMs };
  return { health: "healthy", ageText, ageMs };
}

function FreshnessTile({
  label,
  run,
  staleMs,
}: {
  label: string;
  run: CronStatusRow | null;
  staleMs: number;
}) {
  const { health, ageText } = classifyRun(run, staleMs);
  const dotClass =
    health === "healthy"
      ? "text-emerald-300"
      : health === "stale"
        ? "text-amber-300"
        : "text-rose-300";
  // Subline reads "ran successfully — N new" so a quiet day reads as
  // "ran — 0 new" rather than the misleading "stale — check cron".
  const subline =
    health === "never"
      ? "no run yet"
      : health === "errored"
        ? "errored — see logs"
        : health === "stale"
          ? "didn't fire — check cron"
          : run?.insertedCount === 0
            ? "ran — 0 new"
            : run?.insertedCount != null
              ? `ran — ${run.insertedCount.toLocaleString()} new`
              : "ran";
  return (
    <Card className="p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#7a8aa0]">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={dotClass}>●</span>
        <span className="text-sm font-medium text-white">{ageText}</span>
      </div>
      <div className="mt-1 text-[10px] text-[#7a8aa0]">{subline}</div>
    </Card>
  );
}

export default async function SalesOverviewPage() {
  const [{ byKey, pendingByKey, total, pendingTotal }, freshness, sbUsage] =
    await Promise.all([
      getLeadCounts(),
      getPipelineFreshness(),
      fetchScrapingBeeUsage(),
    ]);
  const homeSales = byKey["home-sale"] ?? {};
  const businesses = byKey["business-filing"] ?? {};
  const dailyStaleMs = 36 * 60 * 60 * 1000;
  const weeklyStaleMs = 8 * 24 * 60 * 60 * 1000;

  const tiles = [
    {
      label: "New Home Sales",
      href: "/admin/sales/home-sales",
      total: sourceTotal(homeSales),
      newCount: homeSales.new ?? 0,
      pending: pendingByKey["home-sale"] ?? 0,
      coverage: "Harris County (Houston).",
      caption:
        "Address-confirmed residential transfers. Pending = awaiting HCAD address resolution (resolves over 30-60 days).",
    },
    {
      label: "New Businesses",
      href: "/admin/sales/businesses",
      total: sourceTotal(businesses),
      newCount: businesses.new ?? 0,
      pending: pendingByKey["business-filing"] ?? 0,
      coverage:
        "Houston metro 9-county area: Harris, Fort Bend, Montgomery, Brazoria, Galveston, Waller, Liberty, Chambers, San Jacinto.",
      caption:
        "Brand-new businesses with mailable street addresses. Source: Texas Comptroller — New Sales Tax Permits, daily refresh.",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Pipeline overview</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          {total === 0 && pendingTotal === 0
            ? "Scrapers aren't wired yet — once they run, fresh leads land here daily."
            : `${total.toLocaleString()} address-confirmed lead${total === 1 ? "" : "s"} ready to mail. ${pendingTotal.toLocaleString()} more awaiting HCAD address resolution.`}
        </p>
      </Card>

      {/* Live system health: last successful run per source + ScrapingBee budget */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FreshnessTile
          label="Home Sales"
          run={freshness["scrape-harris"]}
          staleMs={dailyStaleMs}
        />
        <FreshnessTile
          label="New Businesses"
          run={freshness["scrape-tx-permits"]}
          staleMs={dailyStaleMs}
        />
        <FreshnessTile
          label="Competitor Intel"
          run={freshness["scrape-competitors"]}
          staleMs={weeklyStaleMs}
        />
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#7a8aa0]">
            ScrapingBee
          </div>
          {sbUsage ? (
            <>
              <div className="mt-1 font-mono text-lg text-white">
                {sbUsage.used.toLocaleString()}{" "}
                <span className="text-xs text-[#7a8aa0]">
                  / {sbUsage.max.toLocaleString()} credits
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#0b1a2e]">
                <div
                  className={`h-full ${
                    sbUsage.used / sbUsage.max > 0.85
                      ? "bg-rose-400"
                      : sbUsage.used / sbUsage.max > 0.6
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                  style={{
                    width: `${Math.min(100, (sbUsage.used / Math.max(1, sbUsage.max)) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[10px] text-[#7a8aa0]">
                {sbUsage.remaining.toLocaleString()} remaining this month
              </div>
            </>
          ) : (
            <div className="mt-1 text-xs text-[#7a8aa0]">
              SCRAPINGBEE_API_KEY not set
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group block"
          >
            <Card className="p-6 transition group-hover:-translate-y-0.5 group-hover:border-[#3a94d6]/60">
              <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
                {t.label}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-semibold text-white">
                  {t.total.toLocaleString()}
                </span>
                <span className="text-xs text-[#7a8aa0]">
                  address-confirmed
                </span>
                {t.newCount > 0 && (
                  <span className="rounded-full bg-[#3a94d6]/20 px-2 py-0.5 text-xs font-medium text-[#3a94d6]">
                    {t.newCount} new
                  </span>
                )}
                {t.pending > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                    +{t.pending} pending
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#cfd9e5]">{t.caption}</p>
              <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-[#cfd9e5]">
                <span className="mr-1 font-semibold uppercase tracking-widest text-emerald-300">
                  Coverage:
                </span>
                {t.coverage}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Compliance posture
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-[#3a94d6]">●</span> Mail-first by default —
            postcards bypass TCPA + DNC entirely.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Phone-call buttons are
            disabled for leads that haven&rsquo;t been DNC-scrubbed.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Internal Do-Not-Contact
            list is honored across every source.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> ADT Authorized Dealer
            identification enforced in every outbound script + mail piece.
          </li>
        </ul>
        <p className="mt-4 text-xs text-[#7a8aa0]">
          ADT&rsquo;s dealer-specific rules (caller scripts, mail-piece
          approvals, brand standards) require pulling the current ADT
          Authorized Dealer Compliance Handbook from your ADT rep before
          phone-outreach features go live. Mail-only path can ship without
          that.
        </p>
      </Card>
    </div>
  );
}
