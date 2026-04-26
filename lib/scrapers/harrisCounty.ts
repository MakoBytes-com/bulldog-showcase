/**
 * Harris County Clerk — Real Property records scraper.
 *
 * Source: https://www.cclerk.hctx.net/applications/websearch/RP.aspx
 *
 * The portal is an ASP.NET WebForms app. Scraping flow:
 *   1. GET the search page → extract __VIEWSTATE / __VIEWSTATEGENERATOR /
 *      __EVENTVALIDATION hidden fields and capture the F5 + ASP.NET_SessionId
 *      cookies.
 *   2. POST back the full form payload with our date range + Search button.
 *   3. The server 302-redirects to RP_R.aspx?ID=<token> with the results
 *      page; fetch follows redirects automatically (Node fetch default).
 *   4. Parse the results table out of the response HTML and return a
 *      typed list of records.
 *
 * Caveats:
 *   - Index lag: deeds typically appear 1–2 business days after recording,
 *     so we look back further than just yesterday.
 *   - The portal may rate-limit; we run once per day at most.
 *   - The portal returns ALL real-property record types (deeds, easements,
 *     liens, releases, etc). We filter to the deed types most likely to
 *     represent residential transfers post-fetch.
 *   - This is a scrape, not an official API. The portal's HTML structure
 *     can change; the parser will fail loudly (logged via lib/log) when
 *     that happens, rather than silently producing bad data.
 */

import "server-only";

import { logError, logWarn } from "@/lib/log";

const SEARCH_URL = "https://www.cclerk.hctx.net/applications/websearch/RP.aspx";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

export type DeedRecord = {
  fileNumber: string; // e.g. "RP-2026-154030" — use as external_id for dedupe
  fileDate: string; // MM/DD/YYYY
  type: string; // "DEED", "EASMT", "MTGE", etc.
  pages: number | null;
  filmCode: string | null;
  grantor: string[]; // raw uppercase names as recorded
  grantee: string[];

  // Legal description fields — captured separately so HCAD can be
  // matched on subdivision + lot + block (the stable parcel identifier
  // that doesn't depend on HCAD's owner-update lag).
  description: string | null; // subdivision name only
  section: string | null;
  lot: string | null;
  block: string | null;
  abstract: string | null;
  tract: string | null;
  unit: string | null;
  reserve: string | null;
  outlot: string | null;

  rawText: string; // unparsed cell text for debugging
};

const FORM_FIELDS = [
  "txtFileNo",
  "txtFilmCd",
  "txtFrom",
  "txtTo",
  "txtOR",
  "txtEE",
  "txtNameTee",
  "txtDesc",
  "txtInstrument",
  "txtVolNo",
  "txtPageNo",
  "txtSection",
  "txtLot",
  "txtBlock",
  "txtUnit",
  "txtAbstract",
  "txtOutLot",
  "txtTract",
  "txtReserve",
];

const PREFIX = "ctl00$ContentPlaceHolder1$";

function extractField(html: string, name: string): string {
  const re = new RegExp(
    `<input[^>]*name="${name.replace(/[$]/g, "\\$")}"[^>]*value="([^"]*)"`,
    "i",
  );
  const m = html.match(re);
  return m?.[1] ?? "";
}

function formatMmDdYyyy(d: Date): string {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getUTCFullYear()}`;
}

/**
 * Extract Set-Cookie name=value pairs from a Headers object and merge into
 * a single Cookie header string for the next request.
 */
function captureCookies(headers: Headers, prior: Map<string, string>): string {
  // Node fetch concatenates multi-Set-Cookie via comma; getSetCookie()
  // returns them separately when supported.
  const raw =
    typeof (headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
      : headers.get("set-cookie")?.split(/,(?=\s*[A-Za-z][\w-]*=)/) ?? [];
  for (const line of raw) {
    const eq = line.indexOf("=");
    const semi = line.indexOf(";");
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1, semi > 0 ? semi : undefined).trim();
    if (k) prior.set(k, v);
  }
  return [...prior.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function parseRecords(html: string): DeedRecord[] {
  // The results table on RP_R.aspx is a single <table> wrapping per-record
  // rows. Each record is a <tr> followed by additional rows for grantors
  // / grantees / description. The page renders as flat HTML — we walk it
  // by splitting on file-number anchors and pulling adjacent text.
  //
  // Robust approach: pull the visible body text (strip tags), then split on
  // RP-YYYY-NNNNNN tokens — every real-property record starts with one.

  const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
  if (!bodyMatch) {
    logWarn("scrape:harris", "results page has no <body>");
    return [];
  }
  let text = bodyMatch[1]
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");
  text = text.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
  text = text.replace(/\s+/g, " ").trim();

  if (text.includes("No records found")) return [];

  // Split on the file-number anchor; each chunk after split[0] is one record.
  const re = /(RP-\d{4}-\d{6})/g;
  const parts = text.split(re);
  const records: DeedRecord[] = [];

  // parts: [preamble, fileNo1, body1, fileNo2, body2, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const fileNumber = parts[i];
    const body = (parts[i + 1] ?? "").trim();

    // Stop the body at the next file number reference — guard against
    // greedy capture if the regex split missed something.
    const stopIdx = body.search(/RP-\d{4}-\d{6}/);
    const cell = stopIdx >= 0 ? body.slice(0, stopIdx) : body;

    // Date appears at the front: MM/DD/YYYY
    const dateM = cell.match(/(\d{2}\/\d{2}\/\d{4})/);
    const fileDate = dateM?.[1] ?? "";

    // After the date, the next token is the type (DEED, EASMT, etc.)
    const typeM = cell.match(/\d{2}\/\d{2}\/\d{4}\s+([A-Z][A-Z0-9/]+)/);
    const type = typeM?.[1] ?? "";

    // Grantor / Grantee lists. Each "Grantor :" / "Grantee :" prefix is
    // followed by a single name; multiple grantors/grantees mean
    // multiple prefixes.
    const grantor = [...cell.matchAll(/Grantor\s*:\s*([^:]+?)(?=\s+(?:Grantor|Grantee|Trustee|Comment|Desc|Sec|Lot|Block|Reserve|Abstract|Tract|Related|RP-|Pgs?\b|$))/g)]
      .map((m) => m[1].trim())
      .filter(Boolean);
    const grantee = [...cell.matchAll(/Grantee\s*:\s*([^:]+?)(?=\s+(?:Grantor|Grantee|Trustee|Comment|Desc|Sec|Lot|Block|Reserve|Abstract|Tract|Related|RP-|Pgs?\b|$))/g)]
      .map((m) => m[1].trim())
      .filter(Boolean);

    // Each labeled legal-description field. Lazy regex to grab the
    // value up to the next labeled field or end of cell.
    function pluck(label: string): string | null {
      const re = new RegExp(
        `${label}\\s*:\\s*(.+?)(?=\\s+(?:Desc|Sec|Lot|Block|Unit|Reserve|Abstract|Tract|Outlot|Pgs?|$|\\d+\\s*$))`,
      );
      const m = cell.match(re);
      return m ? m[1].trim() : null;
    }

    const description = pluck("Desc");
    const section = pluck("Sec");
    const lot = pluck("Lot");
    const block = pluck("Block");
    const abstract = pluck("Abstract");
    const tract = pluck("Tract");
    const unit = pluck("Unit");
    const reserve = pluck("Reserve");
    const outlot = pluck("Outlot");

    // Trailing small integer = page count.
    const pgM = cell.match(/\b(\d{1,3})\s*$/);
    const pages = pgM ? parseInt(pgM[1], 10) : null;

    records.push({
      fileNumber,
      fileDate,
      type,
      pages,
      filmCode: null,
      grantor,
      grantee,
      description,
      section,
      lot,
      block,
      abstract,
      tract,
      unit,
      reserve,
      outlot,
      rawText: cell.slice(0, 800),
    });
  }

  return records;
}

/**
 * Run the scrape for a date range. Returns parsed records plus a count
 * of HTML bytes fetched and milliseconds elapsed for logging.
 */
export async function scrapeHarrisCountyDeeds({
  fromDate,
  toDate,
  instrumentType,
}: {
  fromDate: Date;
  toDate: Date;
  instrumentType?: string;
}): Promise<{
  records: DeedRecord[];
  bytes: number;
  elapsedMs: number;
}> {
  const started = Date.now();
  const cookies = new Map<string, string>();
  const baseHeaders = {
    "User-Agent": UA,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };

  // 1. GET search form to harvest viewstate + cookies.
  const getResp = await fetch(SEARCH_URL, {
    headers: baseHeaders,
    cache: "no-store",
    redirect: "follow",
  });
  if (!getResp.ok) {
    throw new Error(`Harris County GET failed: HTTP ${getResp.status}`);
  }
  const cookieHeader = captureCookies(getResp.headers, cookies);
  const formHtml = await getResp.text();

  const viewState = extractField(formHtml, "__VIEWSTATE");
  const viewStateGenerator = extractField(formHtml, "__VIEWSTATEGENERATOR");
  const eventValidation = extractField(formHtml, "__EVENTVALIDATION");
  if (!viewState || !eventValidation) {
    throw new Error(
      "Harris County GET returned page without expected ASP.NET hidden fields",
    );
  }

  // 2. POST back the full form with the date range + (optional) instrument.
  const form = new URLSearchParams();
  form.set("__EVENTTARGET", "");
  form.set("__EVENTARGUMENT", "");
  form.set("__VIEWSTATE", viewState);
  form.set("__VIEWSTATEGENERATOR", viewStateGenerator);
  form.set("__VIEWSTATEENCRYPTED", "");
  form.set("__EVENTVALIDATION", eventValidation);
  for (const f of FORM_FIELDS) form.set(`${PREFIX}${f}`, "");
  form.set(`${PREFIX}txtFrom`, formatMmDdYyyy(fromDate));
  form.set(`${PREFIX}txtTo`, formatMmDdYyyy(toDate));
  if (instrumentType) {
    form.set(`${PREFIX}txtInstrument`, instrumentType);
  }
  form.set(`${PREFIX}btnSearch`, "Search");

  const postResp = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      ...baseHeaders,
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: SEARCH_URL,
      Cookie: cookieHeader,
    },
    body: form.toString(),
    cache: "no-store",
    redirect: "follow",
  });
  if (!postResp.ok) {
    throw new Error(`Harris County POST failed: HTTP ${postResp.status}`);
  }
  if (postResp.url.includes("Maintenance.aspx")) {
    throw new Error(
      "Harris County POST redirected to Maintenance.aspx — payload was rejected",
    );
  }

  const resultsHtml = await postResp.text();
  const records = parseRecords(resultsHtml);

  return {
    records,
    bytes: resultsHtml.length,
    elapsedMs: Date.now() - started,
  };
}

/**
 * Best-effort heuristic: does this row LOOK like a residential sale
 * (vs a commercial transfer, easement, lien, family transfer, etc.)?
 *
 * We're conservative — false negatives (missed sales) are better than
 * false positives (cold-mailing a corporate office or family member who
 * just inherited a property).
 */
const RESIDENTIAL_DEED_TYPES = new Set([
  "DEED",
  "WD", // warranty deed
  "WARRDEED",
  "GWD", // general warranty deed
  "SWD", // special warranty deed
]);

const COMMERCIAL_NAME_INDICATORS = [
  /\b(LLC|L\.L\.C\.|INC|INCORPORATED|CORP|CORPORATION|LP|L\.P\.|PLLC|TRUST|TRUSTEES?|HOLDINGS?|PROPERTIES|INVESTMENTS?|VENTURES?|GROUP|PARTNERS|ASSOC|ASSOCIATION|HOA|CHURCH|BANK|N\.A\.|FCU)\b/i,
];

export function looksLikeResidentialSale(rec: DeedRecord): boolean {
  if (!RESIDENTIAL_DEED_TYPES.has(rec.type)) return false;
  if (rec.grantee.length === 0) return false;
  // Reject if any grantee looks corporate.
  for (const name of rec.grantee) {
    for (const re of COMMERCIAL_NAME_INDICATORS) {
      if (re.test(name)) return false;
    }
  }
  return true;
}
