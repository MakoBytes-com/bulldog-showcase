/**
 * BBB Business Profile scraper. Fetches public reputation stats for
 * residential-security competitors so the Bulldog sales team can write
 * canvasser scripts and ad copy that honestly addresses pain points
 * customers report about Vivint / SimpliSafe / ADT / etc.
 *
 * Aggregate-only — we never identify individual reviewers or
 * cross-reference complaints to specific people. That's pretexting and
 * a legal landmine for an ADT dealer (see /admin/sales/about).
 *
 * BBB renders a Next.js-style page with structured data embedded as
 * key:value pairs in the HTML. We extract via regex — no real DOM
 * parsing needed for the ~6 fields we want.
 */

import "server-only";

import { createHash } from "node:crypto";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

export type BbbStats = {
  bbbRating: string | null;
  bbbAccredited: boolean | null;
  accreditedSince: string | null;
  totalComplaints: number | null;
  totalReviews: number | null;
  averageReviewRating: number | null;
  yearsInBusiness: number | null;
};

export type BbbComplaint = {
  bodyHash: string; // sha256 of body — primary dedupe key per competitor
  filedDate: string | null; // MM/DD/YYYY as displayed
  complaintType: string | null; // "Order Issues", "Billing", etc
  status: string | null; // "Resolved", "Answered", etc
  body: string;
};

function pluck(html: string, pattern: RegExp): string | null {
  const m = html.match(pattern);
  return m ? m[1] : null;
}

function pluckInt(html: string, pattern: RegExp): number | null {
  const v = pluck(html, pattern);
  if (!v) return null;
  const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function pluckFloat(html: string, pattern: RegExp): number | null {
  const v = pluck(html, pattern);
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export async function fetchBbbStats(bbbUrl: string): Promise<BbbStats> {
  // BBB is behind Cloudflare bot management which blocks Vercel's
  // data-center IPs. We route through ScrapingBee's residential
  // proxy network. Free tier = 1000 credits/month; CF-bypass calls
  // cost ~10 credits each. 6 competitors × weekly cron = ~240/mo.
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY not set");
  }

  const proxyUrl = new URL("https://app.scrapingbee.com/api/v1/");
  proxyUrl.searchParams.set("api_key", apiKey);
  proxyUrl.searchParams.set("url", bbbUrl);
  proxyUrl.searchParams.set("premium_proxy", "true"); // residential IPs for CF bypass
  proxyUrl.searchParams.set("country_code", "us");
  // We don't need JS rendering — BBB embeds the stats we want as
  // string literals in the initial HTML response. Cheaper credits.
  proxyUrl.searchParams.set("render_js", "false");

  const resp = await fetch(proxyUrl.toString(), {
    headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8" },
    cache: "no-store",
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(
      `ScrapingBee HTTP ${resp.status} for ${bbbUrl}: ${body.slice(0, 200)}`,
    );
  }
  const html = await resp.text();

  const bbbRating = pluck(html, /"bbbRating"\s*:\s*"([A-F][+-]?|NR)"/);
  const totalComplaints = pluckInt(html, /"complaintsTotal"\s*:\s*(\d+)/);
  const totalReviews = pluckInt(html, /"reviewsTotal"\s*:\s*(\d+)/);
  const yearsInBusiness = pluckInt(html, /"yearsInBusiness"\s*:\s*(\d+)/);
  const averageReviewRating = pluckFloat(
    html,
    /"averageReviewRating"\s*:\s*([\d.]+)/,
  );

  // Accreditation is usually surfaced as "BBB Accredited Since: <date>"
  // in visible HTML; absence ⇒ not accredited.
  const accreditedSinceMatch = html.match(
    /BBB Accredited Since:[\s\S]{0,80}?(\d{1,2}\/\d{1,2}\/\d{4})/,
  );
  const accreditedSince = accreditedSinceMatch ? accreditedSinceMatch[1] : null;
  const bbbAccredited = accreditedSince !== null;

  return {
    bbbRating,
    bbbAccredited,
    accreditedSince,
    totalComplaints,
    totalReviews,
    averageReviewRating,
    yearsInBusiness,
  };
}

/**
 * Fetch the most recent customer complaints from a competitor's BBB
 * /complaints subpath. BBB renders complaint cards via client-side
 * JS so we need ScrapingBee's render_js=true (more credits, but
 * unavoidable for this data).
 *
 * Returns up to ~10 most recent complaint summaries — that's what
 * BBB shows on page 1. Older complaints are accessible via paging
 * but for competitor-intel purposes the freshest 10 is plenty.
 */
export async function fetchBbbComplaints(
  bbbProfileUrl: string,
): Promise<BbbComplaint[]> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY not set");
  }
  const complaintsUrl = bbbProfileUrl.replace(/\/?$/, "") + "/complaints";

  const proxyUrl = new URL("https://app.scrapingbee.com/api/v1/");
  proxyUrl.searchParams.set("api_key", apiKey);
  proxyUrl.searchParams.set("url", complaintsUrl);
  proxyUrl.searchParams.set("premium_proxy", "true");
  proxyUrl.searchParams.set("country_code", "us");
  proxyUrl.searchParams.set("render_js", "true");
  proxyUrl.searchParams.set("wait", "2500");

  const resp = await fetch(proxyUrl.toString(), {
    headers: { "User-Agent": UA },
    cache: "no-store",
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(
      `ScrapingBee complaints HTTP ${resp.status} for ${complaintsUrl}: ${body.slice(0, 160)}`,
    );
  }
  const html = await resp.text();

  // Extract every <div class="...complaint-body...">...</div>. Anchor to
  // a closing </div> on the same level — naive but the rendered HTML
  // doesn't nest more <div> inside the body content.
  const bodyMatches = [
    ...html.matchAll(
      /class="[^"]*complaint-body[^"]*"[^>]*>([\s\S]*?)<\/div>/g,
    ),
  ];

  const complaints: BbbComplaint[] = [];
  let cursor = 0;

  for (const m of bodyMatches) {
    const rawBody = m[1];
    const body = rawBody
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/REMOVED/g, "[REMOVED]") // BBB redacts $$ and PII as REMOVED
      .replace(/\s+/g, " ")
      .trim();

    if (body.length < 30) continue; // skip empty / too-short
    if (body.length > 4000) continue; // suspicious — probably matched too greedy

    // Walk backward in the HTML up to ~1800 chars from match start
    // to find this card's header metadata (Date / Type / Status).
    const start = Math.max(cursor, m.index! - 1800);
    const header = html.slice(start, m.index!);
    cursor = m.index! + m[0].length;

    const dateMatch = header.match(/Date:\s*<[^>]+>\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
    const typeMatch = header.match(/Type:\s*<[^>]+>\s*([^<]+)</);
    const statusMatch = header.match(/Status:\s*<[^>]+>\s*([^<]+)</);

    const filedDate = dateMatch?.[1] ?? null;
    const complaintType = typeMatch?.[1].trim() ?? null;
    const status = statusMatch?.[1].trim() ?? null;

    const bodyHash = createHash("sha256").update(body).digest("hex");

    complaints.push({
      bodyHash,
      filedDate,
      complaintType,
      status,
      body,
    });
  }

  return complaints;
}

/**
 * The competitor seed list. Each entry is a residential security
 * brand Bulldog runs into in the Houston / Texas market. URLs are
 * stable BBB Business Profile pages — verified 2026-04-26.
 */
export const COMPETITOR_SEED = [
  {
    slug: "vivint",
    name: "Vivint Smart Home",
    bbbUrl:
      "https://www.bbb.org/us/ut/lehi/profile/security-systems/vivint-smart-home-1166-4002276",
  },
  {
    slug: "simplisafe",
    name: "SimpliSafe",
    bbbUrl:
      "https://www.bbb.org/us/ma/boston/profile/burglar-alarm-systems/simplisafe-inc-0021-129235",
  },
  {
    slug: "adt",
    name: "ADT LLC",
    bbbUrl:
      "https://www.bbb.org/us/ma/west-springfield/profile/burglar-alarm-systems/adt-llc-0261-100542",
  },
  {
    slug: "brinks",
    name: "Brinks Home",
    bbbUrl:
      "https://www.bbb.org/us/tx/dallas/profile/burglar-alarm-systems/brinks-home-0875-90346299",
  },
  {
    slug: "ring",
    name: "Ring",
    bbbUrl:
      "https://www.bbb.org/us/ca/santa-monica/profile/security-cameras/ring-1216-258909",
  },
  {
    slug: "frontpoint",
    name: "Frontpoint Security",
    bbbUrl:
      "https://www.bbb.org/us/va/sterling/profile/burglar-alarm-systems/frontpoint-security-solutions-llc-0241-213917567",
  },
] as const;
