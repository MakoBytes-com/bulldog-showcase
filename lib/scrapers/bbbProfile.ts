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
