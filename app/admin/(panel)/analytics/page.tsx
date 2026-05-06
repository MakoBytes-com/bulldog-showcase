import {
  getAverageTimeOnPage,
  getCtaByLocation,
  getEventCounts,
  getTopCountries,
  getTopPages,
  getTopReferrers,
  getTotals,
  getTrafficDaily,
  getWebVitals,
  getWebVitalsByPath,
  type WebVitalMetric,
  type WebVitalPageRow,
  type WebVitalStat,
} from "@/lib/analytics/queries";
import { Card, EmptyState, PageHeader } from "../../_components/ui";
import { CtaLocationChart, TrafficChart } from "./AnalyticsCharts";

export const metadata = { title: "Analytics" };

// Keep the data fresh-ish without hammering Neon on every admin refresh.
// 60s is plenty for a dashboard you check a couple times a day.
export const revalidate = 60;

export default async function AnalyticsPage() {
  const [
    totals,
    traffic,
    topPages,
    topReferrers,
    topCountries,
    timeOnPage,
    events,
    ctaByLocation,
    webVitals,
    webVitalsByPath,
  ] = await Promise.all([
    getTotals(),
    getTrafficDaily(),
    getTopPages(10),
    getTopReferrers(10),
    getTopCountries(10),
    getAverageTimeOnPage(10),
    getEventCounts(12),
    getCtaByLocation(),
    getWebVitals(),
    getWebVitalsByPath(15, 3),
  ]);

  const anyData = totals.views + totals.conversions > 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle={
          anyData
            ? `Last 30 days · ${totals.views.toLocaleString()} page views`
            : "No traffic yet. Page views and conversions will appear here as visitors arrive."
        }
      />

      {/* Summary tiles */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Page Views (30d)" value={totals.views} />
        <StatTile label="Sessions (30d)" value={totals.sessions} />
        <StatTile label="Conversions (30d)" value={totals.conversions} />
      </div>

      {!anyData ? (
        <EmptyState
          title="Collecting data"
          description="Visit the public site once to confirm the tracker is wired up — your page view will appear here within a minute (the dashboard caches for 60 seconds)."
        />
      ) : null}

      {/* Traffic chart */}
      <Card className="mb-6 p-6">
        <h3 className="mb-4 text-base font-semibold text-white">
          Site Traffic (Last 30 Days)
        </h3>
        <TrafficChart data={traffic} />
      </Card>

      {/* Two-column: top pages + top referrers */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-white">
            Top Pages (30d)
          </h3>
          {topPages.length === 0 ? (
            <p className="text-sm text-[#7a8aa0]">No traffic data yet.</p>
          ) : (
            <div className="space-y-1">
              {topPages.map((row) => (
                <div
                  key={row.path}
                  className="flex items-center justify-between border-b border-[#1d3554]/60 py-2 last:border-0"
                >
                  <a
                    href={row.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-[#cfd9e5] underline-offset-4 transition hover:text-white hover:underline"
                    title={`Open ${row.path} in a new tab`}
                  >
                    {row.path}
                  </a>
                  <span className="ml-4 shrink-0 text-sm font-medium text-white">
                    {row.count.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-white">
            Top Referrers (30d)
          </h3>
          {topReferrers.named.length === 0 && topReferrers.direct === 0 ? (
            <p className="text-sm text-[#7a8aa0]">
              No referrer data yet. Traffic from Google, LinkedIn, etc.
              will show up here.
            </p>
          ) : (
            <div className="space-y-1">
              {topReferrers.named.map((row) => (
                <div
                  key={row.source}
                  className="flex items-center justify-between border-b border-[#1d3554]/60 py-2"
                >
                  <span className="truncate text-sm text-[#cfd9e5]">
                    {row.source}
                  </span>
                  <span className="ml-4 shrink-0 text-sm font-medium text-white">
                    {row.count.toLocaleString()} visits
                  </span>
                </div>
              ))}
              {topReferrers.direct > 0 ? (
                <div
                  className="flex items-center justify-between py-2"
                  title="Visits with no referrer — typed URL, bookmarks, privacy-hardened search engines (DuckDuckGo, Brave), or in-app browsers that strip the Referer header."
                >
                  <span className="text-sm italic text-[#7a8aa0]">
                    Direct / Unknown
                  </span>
                  <span className="ml-4 shrink-0 text-sm font-medium text-[#cfd9e5]">
                    {topReferrers.direct.toLocaleString()} visits
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>

      {/* Average time on page — timestamp subtraction within sessions */}
      <Card className="mb-6 p-6">
        <h3 className="mb-1 text-base font-semibold text-white">
          Average Time on Page (30d)
        </h3>
        <p className="mb-4 text-xs text-[#7a8aa0]">
          How long people actually read each page before clicking somewhere
          else. Last page of a session doesn&rsquo;t contribute (no follow-up
          click to measure against).
        </p>
        {timeOnPage.length === 0 ? (
          <p className="text-sm text-[#7a8aa0]">
            Not enough multi-page sessions yet. Pages need at least 2
            follow-up clicks to show a stable average.
          </p>
        ) : (
          <div className="space-y-1">
            {timeOnPage.map((row) => (
              <div
                key={row.path}
                className="flex items-center justify-between border-b border-[#1d3554]/60 py-2 last:border-0"
              >
                <a
                  href={row.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm text-[#cfd9e5] underline-offset-4 transition hover:text-white hover:underline"
                  title={`Open ${row.path} in a new tab`}
                >
                  {row.path}
                </a>
                <span className="ml-4 shrink-0 text-right">
                  <span className="block text-sm font-medium text-white">
                    {formatDuration(row.avgSeconds)}
                  </span>
                  <span className="block text-[11px] text-[#7a8aa0]">
                    {row.sampleSize.toLocaleString()} sample
                    {row.sampleSize === 1 ? "" : "s"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Visitor countries — populated only on production (Vercel edge) */}
      <Card className="mb-6 p-6">
        <h3 className="mb-1 text-base font-semibold text-white">
          Top Countries (30d)
        </h3>
        <p className="mb-4 text-xs text-[#7a8aa0]">
          Detected from Vercel edge headers. Local/preview traffic appears
          as blank and is hidden.
        </p>
        {topCountries.length === 0 ? (
          <p className="text-sm text-[#7a8aa0]">
            No country data yet. Visits from the live site will appear
            here within a minute.
          </p>
        ) : (
          <div className="space-y-1">
            {topCountries.map((row) => (
              <div
                key={row.code}
                className="flex items-center justify-between border-b border-[#1d3554]/60 py-2 last:border-0"
              >
                <span className="flex items-center gap-3 text-sm text-[#cfd9e5]">
                  <code className="rounded bg-[#0b1a2e] px-2 py-1 font-mono text-xs text-[#4fa8e0]">
                    {row.code}
                  </code>
                  <span>{row.name}</span>
                </span>
                <span className="ml-4 shrink-0 text-sm font-medium text-white">
                  {row.count.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Core Web Vitals — field data from real visitor browsers */}
      <Card className="mb-6 p-6">
        <h3 className="mb-1 text-base font-semibold text-white">
          Core Web Vitals (30d, field data)
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-[#7a8aa0]">
          Five scores Google uses to rank your site. Each one answers a
          different &ldquo;is the site fast and smooth?&rdquo; question,
          measured from real visitor browsers. Goal: all five in the green
          band.
        </p>
        {webVitals.every((v) => v.samples === 0) ? (
          <p className="text-sm text-[#7a8aa0]">
            Collecting data. Visit a public page to seed the first samples
            — Web Vitals fire on page-hide, so you&rsquo;ll see entries
            appear after you navigate away from the page.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {webVitals.map((v) => (
              <WebVitalTile key={v.metric} stat={v} />
            ))}
          </div>
        )}

        {/* Per-page breakdown — which specific pages are dragging metrics */}
        {webVitalsByPath.length > 0 ? (
          <div className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#4fa8e0]">
              Per-page breakdown (top {webVitalsByPath.length} pages)
            </h4>
            <p className="mt-2 mb-3 text-[11px] leading-relaxed text-[#7a8aa0]">
              One row per page. Each cell shows that page&rsquo;s P75 for
              the metric, color-coded against Google&rsquo;s thresholds.
              Use it to spot which specific page is dragging a site-wide
              score into yellow or red. Pages with fewer than 3 samples
              are hidden.
            </p>
            <div className="overflow-x-auto rounded-lg border border-[#1d3554]">
              <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
                <thead className="bg-[#0b1a2e]">
                  <tr>
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#7a8aa0]">
                      Page
                    </th>
                    {(["lcp", "inp", "cls", "fcp", "ttfb"] as WebVitalMetric[]).map(
                      (m) => (
                        <th
                          key={m}
                          className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-widest text-[#7a8aa0]"
                        >
                          {m.toUpperCase()}
                        </th>
                      ),
                    )}
                    <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-widest text-[#7a8aa0]">
                      Samples
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {webVitalsByPath.map((row) => (
                    <WebVitalPathRow key={row.path} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* How to read this card — always visible, plain English */}
        <div className="mt-6 rounded-lg border border-[#1d3554] bg-[#0b1a2e] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#4fa8e0]">
            How to read this card
          </h4>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-[#cfd9e5]">
            <li>
              <strong className="text-white">Live and automatic.</strong>{" "}
              Each tile recalculates every time this page loads (cached up
              to 60 seconds). If site speed drops tomorrow, the affected
              tile flips from green to yellow or red on its own — no
              action needed from you.
            </li>
            <li>
              <strong className="text-white">Green / yellow / red.</strong>{" "}
              Green means the score is in Google&rsquo;s &ldquo;good&rdquo;
              band. Yellow means &ldquo;needs work.&rdquo; Red means
              &ldquo;poor&rdquo; and will actively hurt search rankings.
              Gray means no data yet.
            </li>
            <li>
              <strong className="text-white">The mini-bar at the bottom
              of each tile</strong> shows the split of all visits — so if
              most people have a fast experience but a few don&rsquo;t,
              you can see that at a glance.
            </li>
            <li>
              <strong className="text-white">Why your own test visit
              takes a few seconds to appear:</strong> Web Vitals are only
              final when a visitor leaves the page (closes the tab,
              navigates away). So the data for a visit lands in the
              dashboard a few seconds <em>after</em> the visitor is gone
              — not while they&rsquo;re still browsing. To test yourself,
              visit a public page, wait 2-3 seconds, close the tab, then
              refresh this analytics page — your visit will show up in
              the sample counts.
            </li>
            <li>
              <strong className="text-white">Why this matters:</strong>{" "}
              these are the <em>exact</em> speed numbers Google uses to
              rank the site. Lighthouse scores from PageSpeed Insights
              are synthetic tests and are usually pessimistic. What
              you&rsquo;re looking at here is the real experience of
              real visitors — which is what Google&rsquo;s ranking
              systems actually see.
            </li>
          </ul>
        </div>
      </Card>

      {/* CTA by location + all events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-1 text-base font-semibold text-white">
            CTA Placement Performance (30d)
          </h3>
          <p className="mb-4 text-xs text-[#7a8aa0]">
            Which button location is actually pulling its weight?
          </p>
          {ctaByLocation.length === 0 ? (
            <p className="text-sm text-[#7a8aa0]">
              No conversion events yet.
            </p>
          ) : (
            <CtaLocationChart data={ctaByLocation} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-white">
            All Conversion Events (30d)
          </h3>
          {events.length === 0 ? (
            <p className="text-sm text-[#7a8aa0]">
              Phone calls, schedule clicks, form submissions and email
              clicks will list here.
            </p>
          ) : (
            <div className="space-y-1">
              {events.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between border-b border-[#1d3554]/60 py-2 last:border-0"
                >
                  <span className="truncate text-sm text-[#cfd9e5]">
                    {row.name}
                  </span>
                  <span className="ml-4 shrink-0 text-sm font-medium text-white">
                    {row.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

// Core Web Vitals thresholds per web.dev (good / needs-improvement / poor).
// CLS is stored ×1000 by WebVitals.tsx so we divide on display. Plain-
// English descriptions are for the admin dashboard — Mako Admin shouldn't
// have to remember what LCP stands for to read the card.
const VITAL_META: Record<
  WebVitalMetric,
  {
    label: string;
    fullName: string;
    plain: string;
    goal: string;
    unit: string;
    good: number;
    poor: number;
    toDisplay: (p75: number) => string;
  }
> = {
  lcp: {
    label: "LCP",
    fullName: "Largest Contentful Paint",
    plain: "How fast the main content of the page shows up.",
    goal: "Good: under 2.5s",
    unit: "ms",
    good: 2500,
    poor: 4000,
    toDisplay: (p) => `${(p / 1000).toFixed(2)}s`,
  },
  inp: {
    label: "INP",
    fullName: "Interaction to Next Paint",
    plain: "How quickly the page reacts when you click or tap.",
    goal: "Good: under 200ms",
    unit: "ms",
    good: 200,
    poor: 500,
    toDisplay: (p) => `${Math.round(p)}ms`,
  },
  cls: {
    // Stored ×1000 on ingest. Thresholds below are on the ×1000 scale too.
    label: "CLS",
    fullName: "Cumulative Layout Shift",
    plain: "How much things jump around as the page loads.",
    goal: "Good: under 0.1",
    unit: "",
    good: 100,
    poor: 250,
    toDisplay: (p) => (p / 1000).toFixed(3),
  },
  fcp: {
    label: "FCP",
    fullName: "First Contentful Paint",
    plain: "How fast anything at all shows up on screen.",
    goal: "Good: under 1.8s",
    unit: "ms",
    good: 1800,
    poor: 3000,
    toDisplay: (p) => `${(p / 1000).toFixed(2)}s`,
  },
  ttfb: {
    label: "TTFB",
    fullName: "Time to First Byte",
    plain: "How fast our server starts sending the page back.",
    goal: "Good: under 800ms",
    unit: "ms",
    good: 800,
    poor: 1800,
    toDisplay: (p) => `${Math.round(p)}ms`,
  },
};

function WebVitalTile({ stat }: { stat: WebVitalStat }) {
  const meta = VITAL_META[stat.metric];
  const rating: "good" | "needs-improvement" | "poor" | "empty" =
    stat.samples === 0
      ? "empty"
      : stat.p75 <= meta.good
        ? "good"
        : stat.p75 <= meta.poor
          ? "needs-improvement"
          : "poor";

  const colors = {
    good: { border: "#1c6b4e", bg: "#0b2318", text: "#4ade80" },
    "needs-improvement": { border: "#6b5a1c", bg: "#231b0b", text: "#facc15" },
    poor: { border: "#6b1c1c", bg: "#230b0b", text: "#f87171" },
    empty: { border: "#1d3554", bg: "#112740", text: "#7a8aa0" },
  }[rating];

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: colors.border, background: colors.bg }}
      title={`${meta.fullName} — ${meta.plain} ${meta.goal}.`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#cfd9e5]">
          {meta.label}
        </span>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: colors.text }}>
          {rating === "empty"
            ? "—"
            : rating === "good"
              ? "Good"
              : rating === "needs-improvement"
                ? "Needs work"
                : "Poor"}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-[#cfd9e5]">
        {meta.plain}
      </p>
      <div
        className="mt-3 text-2xl font-semibold"
        style={{ color: rating === "empty" ? "#cfd9e5" : colors.text }}
      >
        {stat.samples === 0 ? "—" : meta.toDisplay(stat.p75)}
      </div>
      <div className="mt-1 text-[11px] text-[#7a8aa0]">
        P75 · {stat.samples.toLocaleString()} sample
        {stat.samples === 1 ? "" : "s"} · {meta.goal}
      </div>
      {stat.samples > 0 ? (
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-[#0a1422]">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${(stat.good / stat.samples) * 100}%` }}
            title={`Good: ${stat.good}`}
          />
          <div
            className="h-full bg-yellow-500"
            style={{ width: `${(stat.needsImprovement / stat.samples) * 100}%` }}
            title={`Needs improvement: ${stat.needsImprovement}`}
          />
          <div
            className="h-full bg-red-500"
            style={{ width: `${(stat.poor / stat.samples) * 100}%` }}
            title={`Poor: ${stat.poor}`}
          />
        </div>
      ) : null}
    </div>
  );
}

function WebVitalPathRow({ row }: { row: WebVitalPageRow }) {
  const metrics: WebVitalMetric[] = ["lcp", "inp", "cls", "fcp", "ttfb"];
  return (
    <tr className="border-t border-[#1d3554]">
      <td className="px-4 py-3 align-middle">
        <a
          href={row.path}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-[280px] truncate text-[#cfd9e5] underline-offset-4 transition hover:text-white hover:underline"
          title={`Open ${row.path} in a new tab`}
        >
          {row.path}
        </a>
      </td>
      {metrics.map((m) => {
        const meta = VITAL_META[m];
        const cell = row.metrics[m];
        if (cell.p75 === null || cell.samples === 0) {
          return (
            <td key={m} className="px-3 py-3 text-right text-[12px] text-[#7a8aa0]">
              —
            </td>
          );
        }
        const rating: "good" | "needs-improvement" | "poor" =
          cell.p75 <= meta.good
            ? "good"
            : cell.p75 <= meta.poor
              ? "needs-improvement"
              : "poor";
        const color = {
          good: "#4ade80",
          "needs-improvement": "#facc15",
          poor: "#f87171",
        }[rating];
        return (
          <td
            key={m}
            className="px-3 py-3 text-right font-mono text-[12px] font-semibold"
            style={{ color }}
            title={`${cell.samples} sample${cell.samples === 1 ? "" : "s"}`}
          >
            {meta.toDisplay(cell.p75)}
          </td>
        );
      })}
      <td className="px-4 py-3 text-right text-[12px] text-[#cfd9e5]">
        {row.totalSamples.toLocaleString()}
      </td>
    </tr>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#1d3554] bg-[#112740] px-5 py-4">
      <div className="mb-1 text-xs uppercase tracking-widest text-[#7a8aa0]">
        {label}
      </div>
      <div className="text-2xl font-semibold text-white">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
