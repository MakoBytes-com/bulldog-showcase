import Link from "next/link";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { Card, EmptyState, PageHeader, Pill } from "../../_components/ui";
import { ErrorTimeChart } from "./ErrorTimeChart";
import { ResolveButton } from "./ResolveButton";

export const metadata = { title: "Errors" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  range?: string; // "24h" | "7d" | "30d"
  level?: string; // "all" | "error" | "warn"
  module?: string;
  resolved?: string; // "all" | "open" | "resolved"
};

const RANGES: Record<string, { label: string; days: number }> = {
  "24h": { label: "24 hours", days: 1 },
  "7d": { label: "7 days", days: 7 },
  "30d": { label: "30 days", days: 30 },
};

function isoDaysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// Defensive narrow — neon-http db.execute returns a bare array,
// pg-driver returns { rows: [...] }. Existing analytics queries use
// this same pattern.
function rowsOf<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  const r = result as { rows?: unknown[] };
  if (Array.isArray(r.rows)) return r.rows as T[];
  return [];
}

type GroupRow = {
  fingerprint: string;
  level: string;
  module: string;
  message: string;
  occurrences: number;
  first_seen: string;
  last_seen: string;
  unresolved: number;
};

type SeriesRow = {
  bucket: string;
  level: string;
  count: number;
};

type SummaryRow = {
  total: number;
  unresolved: number;
  errors: number;
  warns: number;
  total_24h: number;
  total_prev_24h: number;
};

export default async function ErrorsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rangeKey = (params.range && RANGES[params.range]) ? params.range : "7d";
  const range = RANGES[rangeKey];
  const levelFilter = params.level && ["error", "warn"].includes(params.level)
    ? params.level
    : "all";
  const moduleFilter = params.module?.trim() || "";
  const resolvedFilter = params.resolved && ["open", "resolved"].includes(params.resolved)
    ? params.resolved
    : "open"; // sensible default — show unresolved errors first

  const sinceMain = isoDaysAgo(range.days);
  const since7d = isoDaysAgo(7);
  const since30d = isoDaysAgo(30);
  const since24h = isoDaysAgo(1);
  const since48h = isoDaysAgo(2);

  // Distinct module list (last 30 days, for filter dropdown)
  const moduleListResult = await db.execute<{ module: string }>(sql`
    SELECT DISTINCT module FROM error_events
    WHERE occurred_at > ${since30d.toISOString()}
    ORDER BY module ASC
  `);
  const allModules: string[] = rowsOf<{ module: string }>(moduleListResult).map(
    (r) => r.module,
  );

  // Build a parameterized SQL fragment for the dynamic filter conditions.
  // Drizzle's `sql` template + `.append()` keeps everything bind-parameterized;
  // only string literals from a fixed allow-list (level enum) ever interpolate.
  let filterFragment = sql`occurred_at > ${sinceMain.toISOString()}`;
  if (levelFilter === "error" || levelFilter === "warn") {
    const lvl = levelFilter; // narrowed
    filterFragment = sql`${filterFragment} AND level = ${lvl}`;
  }
  if (moduleFilter) {
    filterFragment = sql`${filterFragment} AND module = ${moduleFilter}`;
  }
  if (resolvedFilter === "open") {
    filterFragment = sql`${filterFragment} AND resolved_at IS NULL`;
  } else if (resolvedFilter === "resolved") {
    filterFragment = sql`${filterFragment} AND resolved_at IS NOT NULL`;
  }

  // Grouped error list
  const groupsResult = await db.execute<GroupRow>(sql`
    SELECT
      fingerprint,
      MAX(level::text) AS level,
      MAX(module) AS module,
      MAX(message) AS message,
      COUNT(*)::int AS occurrences,
      MIN(occurred_at) AS first_seen,
      MAX(occurred_at) AS last_seen,
      COUNT(*) FILTER (WHERE resolved_at IS NULL)::int AS unresolved
    FROM error_events
    WHERE ${filterFragment}
    GROUP BY fingerprint
    ORDER BY MAX(occurred_at) DESC
    LIMIT 200
  `);
  const groups = rowsOf<GroupRow>(groupsResult);

  // Time series — last 7 days regardless of filters
  const seriesResult = await db.execute<SeriesRow>(sql`
    SELECT
      to_char(date_trunc('hour', occurred_at), 'YYYY-MM-DD"T"HH24:00') AS bucket,
      level::text AS level,
      COUNT(*)::int AS count
    FROM error_events
    WHERE occurred_at > ${since7d.toISOString()}
    GROUP BY bucket, level
    ORDER BY bucket ASC
  `);
  const series = rowsOf<SeriesRow>(seriesResult);

  // Summary tiles
  const summaryResult = await db.execute<SummaryRow>(sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE resolved_at IS NULL)::int AS unresolved,
      COUNT(*) FILTER (WHERE level = 'error')::int AS errors,
      COUNT(*) FILTER (WHERE level = 'warn')::int AS warns,
      COUNT(*) FILTER (WHERE occurred_at > ${since24h.toISOString()})::int AS total_24h,
      COUNT(*) FILTER (WHERE occurred_at > ${since48h.toISOString()} AND occurred_at <= ${since24h.toISOString()})::int AS total_prev_24h
    FROM error_events
    WHERE ${filterFragment}
  `);
  const summary = rowsOf<SummaryRow>(summaryResult)[0] ?? {
    total: 0,
    unresolved: 0,
    errors: 0,
    warns: 0,
    total_24h: 0,
    total_prev_24h: 0,
  };

  return (
    <div>
      <PageHeader
        title="Errors"
        subtitle="Server-side errors captured by the in-house logger. Grouped by module + message, like Sentry."
      />

      {/* Summary tiles */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Last 24 hours" value={summary.total_24h} delta={summary.total_24h - summary.total_prev_24h} accent={summary.total_24h > 0} />
        <SummaryTile label={`Total in ${range.label}`} value={summary.total} />
        <SummaryTile label="Unresolved" value={summary.unresolved} accent={summary.unresolved > 0} />
        <SummaryTile label={`Errors / Warns (${range.label})`} value={`${summary.errors} / ${summary.warns}`} />
      </div>

      {/* Time chart */}
      <Card className="mb-6 p-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-[#7a8aa0]">
          Errors per hour — last 7 days
        </h2>
        <p className="mb-4 text-xs text-[#9fb0c7]">
          Stacked by severity. Spikes are usually a signal something just broke
          and needs investigation.
        </p>
        <ErrorTimeChart series={series} />
      </Card>

      {/* Filter bar */}
      <Card className="mb-6 p-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <FilterField label="Time range">
            <select name="range" defaultValue={rangeKey} className={selectClass}>
              {Object.entries(RANGES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Severity">
            <select name="level" defaultValue={levelFilter} className={selectClass}>
              <option value="all">All</option>
              <option value="error">Errors only</option>
              <option value="warn">Warnings only</option>
            </select>
          </FilterField>
          <FilterField label="Module">
            <select name="module" defaultValue={moduleFilter} className={selectClass}>
              <option value="">All modules</option>
              {allModules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Status">
            <select name="resolved" defaultValue={resolvedFilter} className={selectClass}>
              <option value="open">Open (unresolved)</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>
          </FilterField>
          <button
            type="submit"
            className="h-10 rounded-md border border-[#3a94d6] bg-[#152e4a] px-5 text-sm font-semibold text-white transition hover:bg-[#1a3a5c]"
          >
            Apply
          </button>
          <Link
            href="/admin/errors"
            className="h-10 inline-flex items-center text-xs text-[#7a8aa0] hover:text-white"
          >
            Reset
          </Link>
        </form>
      </Card>

      {/* Grouped list */}
      {groups.length === 0 ? (
        <EmptyState
          title="No errors in this view"
          description={
            resolvedFilter === "open"
              ? `No unresolved errors in the last ${range.label}. Either everything's healthy or someone's been clicking Resolve.`
              : "No errors match these filters."
          }
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Module</th>
                <th className="px-5 py-3 font-medium">Message</th>
                <th className="px-5 py-3 font-medium text-right">Count</th>
                <th className="px-5 py-3 font-medium">Last seen</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.fingerprint} className="border-b border-[#1d3554]/60 last:border-0 hover:bg-[#152e4a]">
                  <td className="px-5 py-4">
                    <SeverityPill level={g.level} />
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[#cfd9e5]">{g.module}</td>
                  <td className="max-w-[60ch] px-5 py-4">
                    <Link
                      href={`/admin/errors/${g.fingerprint}`}
                      className="block truncate font-medium text-white transition hover:text-[#3a94d6]"
                      title={g.message}
                    >
                      {g.message}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-white">
                    {g.occurrences.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#9fb0c7]">
                    {formatRelative(g.last_seen)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {g.unresolved > 0 ? (
                      <ResolveButton fingerprint={g.fingerprint} unresolved={g.unresolved} />
                    ) : (
                      <span className="text-xs text-[#9fb0c7]">all resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

const selectClass = "h-10 rounded-md border border-[#1d3554] bg-[#0e2b5c] px-3 text-sm text-white focus:border-[#3a94d6] focus:outline-none";

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7a8aa0]">{label}</span>
      {children}
    </label>
  );
}

function SummaryTile({ label, value, delta, accent }: { label: string; value: string | number; delta?: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-[#ef4444] bg-[#3b1414]" : "border-[#1d3554] bg-[#112740]"}`}>
      <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {typeof delta === "number" && delta !== 0 ? (
        <div className={`mt-1 text-xs ${delta > 0 ? "text-[#fda4af]" : "text-[#86efac]"}`}>
          {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} vs previous 24h
        </div>
      ) : null}
    </div>
  );
}

function SeverityPill({ level }: { level: string }) {
  if (level === "error") return <Pill tone="danger">error</Pill>;
  if (level === "warn") return <Pill tone="warn">warn</Pill>;
  return <Pill>{level}</Pill>;
}

function formatRelative(iso: string | Date): string {
  const t = typeof iso === "string" ? new Date(iso).getTime() : iso.getTime();
  const diff = Date.now() - t;
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 30) return `${day}d ago`;
  return new Date(t).toLocaleDateString("en-US");
}
