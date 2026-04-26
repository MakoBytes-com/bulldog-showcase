/**
 * Aggregation queries that back /admin/analytics. All time-windowed to
 * the last 30 days so the dashboard stays snappy even as rows pile up.
 *
 * Referrer normalization strips protocols + leading "www." so
 * "https://www.google.com/" and "http://google.com" count as one
 * entry. Self-referrals and localhost are dropped.
 *
 * All page_views queries exclude /admin/* paths — those are Makopanel
 * navigation, not public traffic. The client-side self-exclude flag
 * stops new admin rows from landing, but legacy rows exist from before
 * that flag shipped and shouldn't inflate public-site numbers.
 */
import { sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";

const DAYS = 30;

// Shared SQL predicate: "page_views row is not an admin page". Applied
// to every page_views query so public-traffic totals aren't polluted.
const NOT_ADMIN = sql`path not like '/admin%'`;

export type DailyPoint = { date: string; views: number; sessions: number };
export type PathCount = { path: string; count: number };
export type ReferrerCount = { source: string; count: number };
export type EventCount = { name: string; count: number };
export type LocationCount = {
  location: string;
  phone: number;
  schedule: number;
};
export type CountryCount = { code: string; name: string; count: number };
export type TimeOnPage = {
  path: string;
  avgSeconds: number;
  sampleSize: number;
};

export type WebVitalMetric =
  | "lcp"
  | "inp"
  | "cls"
  | "fcp"
  | "ttfb";

export type WebVitalStat = {
  metric: WebVitalMetric;
  /** P75 value — the same percentile Google's Core Web Vitals uses. */
  p75: number;
  samples: number;
  good: number;
  needsImprovement: number;
  poor: number;
};

/**
 * Per-path breakdown of each metric's P75 — used to find the specific
 * page that's regressing when a site-wide Core Web Vital tanks. Limited
 * to top paths by sample count so the table stays readable.
 */
export type WebVitalPageRow = {
  path: string;
  totalSamples: number;
  metrics: Record<WebVitalMetric, { p75: number | null; samples: number }>;
};

export type ReviewClicksBySource = {
  source: string;
  count: number;
};

function isoDaysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function formatShortDate(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}

function normalizeReferrer(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!host) return null;
    if (host === "localhost") return null;
    if (host.endsWith("bulldogsecurityservice.com")) return null; // self-referral
    return host;
  } catch {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed.slice(0, 120) : null;
  }
}

export async function getTrafficDaily(): Promise<DailyPoint[]> {
  const since = isoDaysAgo(DAYS - 1);

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', created_at at time zone 'UTC'), 'YYYY-MM-DD')`,
      views: sql<number>`count(*)::int`,
      sessions: sql<number>`count(distinct session_id)::int`,
    })
    .from(schema.pageViews)
    .where(sql`created_at >= ${since.toISOString()} and ${NOT_ADMIN}`)
    .groupBy(
      sql`date_trunc('day', created_at at time zone 'UTC')`,
    )
    .orderBy(
      sql`date_trunc('day', created_at at time zone 'UTC')`,
    );

  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: DailyPoint[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = isoDaysAgo(i);
    const key = d.toISOString().slice(0, 10);
    const match = byDay.get(key);
    out.push({
      date: formatShortDate(d),
      views: match?.views ?? 0,
      sessions: match?.sessions ?? 0,
    });
  }
  return out;
}

export async function getTotals(): Promise<{
  views: number;
  sessions: number;
  conversions: number;
}> {
  const since = isoDaysAgo(DAYS - 1).toISOString();

  const [[pv], [ev]] = await Promise.all([
    db
      .select({
        views: sql<number>`count(*)::int`,
        sessions: sql<number>`count(distinct session_id)::int`,
      })
      .from(schema.pageViews)
      .where(sql`created_at >= ${since} and ${NOT_ADMIN}`),
    db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(schema.analyticsEvents)
      .where(sql`created_at >= ${since}`),
  ]);

  return {
    views: pv?.views ?? 0,
    sessions: pv?.sessions ?? 0,
    conversions: ev?.total ?? 0,
  };
}

export async function getTopPages(limit = 10): Promise<PathCount[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();
  const rows = await db
    .select({
      path: schema.pageViews.path,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.pageViews)
    .where(sql`created_at >= ${since} and ${NOT_ADMIN}`)
    .groupBy(schema.pageViews.path)
    .orderBy(sql`count(*) desc`)
    .limit(limit);
  return rows;
}

export type TopReferrersResult = {
  named: ReferrerCount[];
  direct: number;
};

/**
 * Top Referrers card data. Two buckets:
 *   - named: visits whose referrer parses to a real external host (after
 *     stripping www., dropping self-referrals + localhost).
 *   - direct: count of visits with no referrer at all — typed URLs,
 *     privacy-hardened search engines (DuckDuckGo, Brave) that strip
 *     the Referer header, in-app browsers that don't forward it, etc.
 *     Rendered as a separate "Direct / Unknown" row so the dashboard
 *     reconciles against total Page Views instead of silently dropping
 *     these visits.
 */
export async function getTopReferrers(
  limit = 10,
): Promise<TopReferrersResult> {
  const since = isoDaysAgo(DAYS - 1).toISOString();

  const [namedRows, [directRow]] = await Promise.all([
    db
      .select({
        referrer: schema.pageViews.referrer,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.pageViews)
      .where(
        sql`created_at >= ${since} and referrer is not null and ${NOT_ADMIN}`,
      )
      .groupBy(schema.pageViews.referrer),
    db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.pageViews)
      .where(
        sql`created_at >= ${since} and referrer is null and ${NOT_ADMIN}`,
      ),
  ]);

  const map = new Map<string, number>();
  let selfReferralCount = 0;
  for (const r of namedRows) {
    const source = normalizeReferrer(r.referrer);
    if (!source) {
      // normalizeReferrer drops self-referrals and localhost; roll
      // those into the Direct / Unknown bucket so the total reconciles
      // with Page Views instead of vanishing.
      selfReferralCount += r.count;
      continue;
    }
    map.set(source, (map.get(source) || 0) + r.count);
  }

  const named = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([source, count]) => ({ source, count }));

  const direct = (directRow?.count ?? 0) + selfReferralCount;

  return { named, direct };
}

export async function getEventCounts(limit = 10): Promise<EventCount[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();
  const rows = await db
    .select({
      name: schema.analyticsEvents.name,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.analyticsEvents)
    .where(sql`created_at >= ${since}`)
    .groupBy(schema.analyticsEvents.name)
    .orderBy(sql`count(*) desc`)
    .limit(limit);
  return rows;
}

/**
 * Top visitor countries (ISO-3166 alpha-2 codes from Vercel's
 * x-vercel-ip-country header, captured at insert time). Populated only
 * on production behind Vercel's edge; local dev rows stay null. The
 * tiny name map covers the common hits so Russell sees "United States"
 * instead of just "US"; anything else falls back to the raw code.
 */
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  GB: "United Kingdom",
  IE: "Ireland",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  AU: "Australia",
  NZ: "New Zealand",
  IN: "India",
  JP: "Japan",
  CN: "China",
  HK: "Hong Kong",
  SG: "Singapore",
  BR: "Brazil",
  AR: "Argentina",
  ZA: "South Africa",
  AE: "United Arab Emirates",
  IL: "Israel",
  PH: "Philippines",
  VN: "Vietnam",
  TH: "Thailand",
  ID: "Indonesia",
  KR: "South Korea",
  TW: "Taiwan",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  CZ: "Czechia",
  PT: "Portugal",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  RU: "Russia",
  UA: "Ukraine",
  TR: "Turkey",
  EG: "Egypt",
  NG: "Nigeria",
};

export async function getTopCountries(limit = 10): Promise<CountryCount[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();
  const rows = await db
    .select({
      code: schema.pageViews.country,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.pageViews)
    .where(
      sql`created_at >= ${since} and country is not null and ${NOT_ADMIN}`,
    )
    .groupBy(schema.pageViews.country)
    .orderBy(sql`count(*) desc`)
    .limit(limit);

  return rows
    .filter((r): r is { code: string; count: number } => typeof r.code === "string")
    .map((r) => ({
      code: r.code,
      name: COUNTRY_NAMES[r.code] ?? r.code,
      count: r.count,
    }));
}

/**
 * Average time on page (in seconds), per path, over the last 30 days.
 *
 * Computed by subtracting consecutive pageview timestamps within the
 * same session. If a user views /services then /contact 45 seconds
 * later, they spent ~45s on /services. The LAST pageview in a session
 * has no successor to subtract from, so it contributes nothing to the
 * average — that's an acceptable bias for a lead-gen site where the
 * main signal is which pages hold attention before a conversion, not
 * exit-page dwell time.
 *
 * Outlier clamp:
 *   - < 2s   → probably a back-navigation or prefetch, not engagement
 *   - > 30min → user walked away from the browser, inflates average
 *
 * Requires at least 2 valid samples per path to filter noise.
 */
export async function getAverageTimeOnPage(
  limit = 10,
): Promise<TimeOnPage[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();

  const rows = await db.execute<{
    path: string;
    avg_seconds: string;
    sample_size: string;
  }>(sql`
    SELECT
      path,
      AVG(seconds) AS avg_seconds,
      COUNT(*)::bigint AS sample_size
    FROM (
      SELECT
        path,
        EXTRACT(EPOCH FROM (
          LEAD(created_at) OVER (
            PARTITION BY session_id ORDER BY created_at
          ) - created_at
        )) AS seconds
      FROM page_views
      WHERE created_at >= ${since} AND ${NOT_ADMIN}
    ) t
    WHERE seconds IS NOT NULL AND seconds BETWEEN 2 AND 1800
    GROUP BY path
    HAVING COUNT(*) >= 2
    ORDER BY AVG(seconds) DESC
    LIMIT ${limit};
  `);

  // Drizzle's db.execute returns an object whose shape depends on driver;
  // with neon-http it's a bare array of rows. Narrow defensively.
  const list = Array.isArray(rows) ? rows : (rows as { rows?: unknown[] }).rows;
  if (!Array.isArray(list)) return [];

  return list
    .map((r) => {
      const row = r as { path?: unknown; avg_seconds?: unknown; sample_size?: unknown };
      const path = typeof row.path === "string" ? row.path : null;
      const avg = Number(row.avg_seconds);
      const n = Number(row.sample_size);
      if (!path || !Number.isFinite(avg) || !Number.isFinite(n)) return null;
      return { path, avgSeconds: Math.round(avg), sampleSize: n };
    })
    .filter((r): r is TimeOnPage => r !== null);
}

/**
 * Core Web Vitals field data — LCP / INP / CLS / FCP / TTFB aggregated
 * over the last 30 days from real visitor browsers. These are what
 * Google actually uses for ranking; Lighthouse scores are synthetic.
 *
 * Events land via `src/components/WebVitals.tsx` → `track()` →
 * `/api/event` with name `web-vital-<metric>` and data `{ value, rating, path }`.
 * CLS values are stored ×1000 on the way in (so integers flow cleanly
 * through the integer-ish analytics pipeline) — we divide back when
 * presenting in the UI.
 *
 * P75 is Postgres percentile_cont at 0.75 — the same threshold Google
 * uses to score a page for the Core Web Vitals assessment.
 */
export async function getWebVitals(): Promise<WebVitalStat[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();
  const { rows } = await db.execute<{
    metric: string;
    p75: string | number;
    samples: string | number;
    good: string | number;
    needs_improvement: string | number;
    poor: string | number;
  }>(sql`
    select
      substring(name from 11) as metric,
      percentile_cont(0.75) within group (
        order by ((data->>'value')::numeric)
      ) as p75,
      count(*)::int as samples,
      count(*) filter (where data->>'rating' = 'good')::int as good,
      count(*) filter (where data->>'rating' = 'needs-improvement')::int as needs_improvement,
      count(*) filter (where data->>'rating' = 'poor')::int as poor
    from analytics_events
    where created_at >= ${since} and name like 'web-vital-%'
    group by name
  `);

  const KNOWN: WebVitalMetric[] = ["lcp", "inp", "cls", "fcp", "ttfb"];
  const byMetric = new Map<string, WebVitalStat>();
  for (const r of rows) {
    if (!KNOWN.includes(r.metric as WebVitalMetric)) continue;
    byMetric.set(r.metric, {
      metric: r.metric as WebVitalMetric,
      p75: Number(r.p75) || 0,
      samples: Number(r.samples) || 0,
      good: Number(r.good) || 0,
      needsImprovement: Number(r.needs_improvement) || 0,
      poor: Number(r.poor) || 0,
    });
  }

  // Return in a stable order matching what CrUX / PageSpeed show.
  return KNOWN.map((m) =>
    byMetric.get(m) ?? {
      metric: m,
      p75: 0,
      samples: 0,
      good: 0,
      needsImprovement: 0,
      poor: 0,
    },
  );
}

/**
 * Per-path breakdown of Core Web Vitals P75 over the last 30 days. Lets
 * Russell spot which specific page is dragging a site-wide metric into
 * the red. Groups by `path` (the event-level path, written by
 * PageViewTracker / track() when the vital fired) and by metric name.
 *
 * Excludes /admin/* paths (not public traffic) and any paths with fewer
 * than `minSamples` total web-vital events — single samples aren't
 * statistically meaningful at P75 and just create noise.
 */
export async function getWebVitalsByPath(
  limit = 15,
  minSamples = 3,
): Promise<WebVitalPageRow[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();
  const { rows } = await db.execute<{
    path: string;
    metric: string;
    p75: string | number;
    samples: string | number;
  }>(sql`
    select
      path,
      substring(name from 11) as metric,
      percentile_cont(0.75) within group (
        order by ((data->>'value')::numeric)
      ) as p75,
      count(*)::int as samples
    from analytics_events
    where created_at >= ${since}
      and name like 'web-vital-%'
      and path not like '/admin%'
    group by path, name
  `);

  const KNOWN: WebVitalMetric[] = ["lcp", "inp", "cls", "fcp", "ttfb"];
  const byPath = new Map<string, WebVitalPageRow>();

  for (const r of rows) {
    if (!KNOWN.includes(r.metric as WebVitalMetric)) continue;
    const row =
      byPath.get(r.path) ??
      ({
        path: r.path,
        totalSamples: 0,
        metrics: Object.fromEntries(
          KNOWN.map((m) => [m, { p75: null, samples: 0 }]),
        ) as WebVitalPageRow["metrics"],
      } as WebVitalPageRow);
    row.metrics[r.metric as WebVitalMetric] = {
      p75: Number(r.p75),
      samples: Number(r.samples),
    };
    row.totalSamples += Number(r.samples);
    byPath.set(r.path, row);
  }

  return [...byPath.values()]
    .filter((r) => r.totalSamples >= minSamples)
    .sort((a, b) => b.totalSamples - a.totalSamples)
    .slice(0, limit);
}

/**
 * Count of "Review Link Clicked" events by the `source` field in the
 * event's JSON data payload — lets Russell see which channel (email
 * template, SMS, QR card, invoice footer) is actually driving clicks.
 * Populated from /review?src=<channel> hits.
 */
export async function getReviewClicksBySource(): Promise<ReviewClicksBySource[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();
  const { rows } = await db.execute<{
    source: string | null;
    count: string | number;
  }>(sql`
    select
      coalesce(data->>'source', 'direct') as source,
      count(*)::int as count
    from analytics_events
    where created_at >= ${since}
      and name = 'Review Link Clicked'
    group by coalesce(data->>'source', 'direct')
  `);

  return rows
    .map((r) => ({
      source: (r.source ?? "direct").toString(),
      count: Number(r.count) || 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * CTA-placement comparison: how many Phone Call vs Schedule Click events
 * fired from each location (Header / Sticky Mobile Bar / Footer / Page
 * Body). Uses the event-name suffix Russell sees in ConversionEvents.tsx
 * so we don't need to parse the JSON payload.
 */
export async function getCtaByLocation(): Promise<LocationCount[]> {
  const since = isoDaysAgo(DAYS - 1).toISOString();
  const rows = await db
    .select({
      name: schema.analyticsEvents.name,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.analyticsEvents)
    .where(
      sql`created_at >= ${since} and (name like 'Phone Call — %' or name like 'Schedule Click — %')`,
    )
    .groupBy(schema.analyticsEvents.name);

  const map = new Map<string, { phone: number; schedule: number }>();
  for (const r of rows) {
    const [kind, location] = r.name.split(" — ");
    if (!location) continue;
    const entry = map.get(location) || { phone: 0, schedule: 0 };
    if (kind === "Phone Call") entry.phone += r.count;
    else if (kind === "Schedule Click") entry.schedule += r.count;
    map.set(location, entry);
  }

  return [...map.entries()]
    .sort((a, b) => b[1].phone + b[1].schedule - (a[1].phone + a[1].schedule))
    .map(([location, v]) => ({ location, phone: v.phone, schedule: v.schedule }));
}
