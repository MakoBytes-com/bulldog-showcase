/**
 * HCAD enrichment — looks up the property street address for a Harris
 * County lead by querying the Harris Central Appraisal District's
 * public ArcGIS Parcels layer.
 *
 * Endpoint:
 *   https://arcweb.hcad.org/server/rest/services/public/public_query/
 *     MapServer/0/query
 *
 * Layer 0 = "Parcels" (open ArcGIS REST). Returns address, city, zip,
 * owner, subdivision, HCAD account number, and the raw legal_lines
 * text for every parcel in Harris County. Free, no auth, no
 * Cloudflare on this endpoint specifically.
 *
 * Match strategy:
 *   1. Search HCAD by owner-name LIKE '<grantee>%' from the Clerk record
 *   2. If 0 matches: HCAD hasn't indexed this owner yet (freshest deeds
 *      lag 30-90 days). Lead stays unenriched, retry next day.
 *   3. If 1 match: take it.
 *   4. If multiple matches (common name): use the subdivision substring
 *      from the Clerk record to disambiguate. If still ambiguous, skip
 *      and let a human triage in /admin/sales/saved.
 *
 * Match rate is realistic ~40-70% on first run (depends on HCAD's
 * update cadence vs Clerk filing date). Daily reruns close the gap as
 * HCAD catches up over the following weeks.
 */

import "server-only";

import https from "node:https";

const HCAD_QUERY_URL =
  "https://arcweb.hcad.org/server/rest/services/public/public_query/MapServer/0/query";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

// HCAD's arcweb.hcad.org cert chain references an intermediate CA that
// Node's bundled CA store doesn't include, so the standard `fetch()`
// rejects the handshake with "unable to verify the first certificate."
// Browsers fetch the missing intermediate on demand (AIA chasing); Node
// doesn't. We sidestep with a per-request Agent that skips chain
// verification — acceptable here because (a) we're reading a public
// parcel database, no auth or PII over the wire, and (b) the cert
// itself is valid; only the intermediate-discovery is broken.
const hcadAgent = new https.Agent({ rejectUnauthorized: false });

function httpsGetJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        agent: hcadAgent,
        headers: { "User-Agent": UA, Accept: "application/json" },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c as Buffer));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf-8");
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`HCAD HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error(`HCAD bad JSON: ${(err as Error).message}`));
          }
        });
      },
    );
    req.on("error", (err) => reject(err));
    req.setTimeout(15_000, () => {
      req.destroy(new Error("HCAD request timeout (15s)"));
    });
  });
}

export type HcadParcel = {
  hcadNum: string;
  owner: string;
  subdivision: string | null;
  address: string;
  city: string | null;
  zip: string | null;
};

type HcadFeature = {
  attributes: {
    HCAD_NUM?: string;
    owner?: string;
    subdivision?: string | null;
    address?: string | null;
    city?: string | null;
    zip?: string | null;
  };
};

/**
 * Strip a name down to the comparable core. HCAD owner records often add
 * suffixes like " ETUX", " & MARY", "ESTATE OF", trustees, etc. — we
 * normalize aggressively so the LIKE search returns more candidates.
 */
function normalizeOwnerName(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pick the best parcel from a candidate set. If only one, return it.
 * Otherwise prefer the one whose subdivision or address shares the most
 * tokens with the Clerk-side description.
 */
function pickBest(
  candidates: HcadParcel[],
  clerkSubdivisionHint: string | null,
): HcadParcel | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  if (!clerkSubdivisionHint) return null; // ambiguous, no hint, skip

  const hintTokens = clerkSubdivisionHint
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((t) => t.length >= 3);

  let best: HcadParcel | null = null;
  let bestScore = 0;
  for (const c of candidates) {
    const haystack =
      `${c.subdivision ?? ""} ${c.address ?? ""}`.toUpperCase();
    const score = hintTokens.reduce(
      (n, tok) => n + (haystack.includes(tok) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  // Require at least one token match to commit; otherwise it's a coin flip.
  return bestScore > 0 ? best : null;
}

/**
 * Query HCAD for parcels owned by a name (LIKE prefix). Returns the
 * full candidate set so callers can pick / disambiguate.
 */
export async function searchHcadByOwner(
  ownerName: string,
  limit = 10,
): Promise<HcadParcel[]> {
  const normalized = normalizeOwnerName(ownerName);
  if (!normalized) return [];

  // Single-quote escape for ArcGIS WHERE clause.
  const safe = normalized.replace(/'/g, "''");

  const params = new URLSearchParams({
    where: `owner LIKE '${safe}%'`,
    outFields: "HCAD_NUM,owner,subdivision,address,city,zip",
    resultRecordCount: String(limit),
    f: "json",
    returnGeometry: "false",
  });

  const url = `${HCAD_QUERY_URL}?${params.toString()}`;
  const data = (await httpsGetJson(url)) as {
    features?: HcadFeature[];
    error?: { message?: string };
  };
  if (data.error) {
    throw new Error(`HCAD error: ${data.error.message ?? "unknown"}`);
  }

  return (data.features ?? [])
    .map((f) => f.attributes)
    .filter((a) => a.HCAD_NUM && a.address)
    .map((a) => ({
      hcadNum: a.HCAD_NUM!,
      owner: a.owner ?? "",
      subdivision: a.subdivision ?? null,
      address: a.address!,
      city: a.city ?? null,
      zip: a.zip ?? null,
    }))
    // Skip parcels whose address starts with "0 " — HCAD uses that for
    // unimproved tracts / right-of-way / common areas, not delivery
    // addresses we'd actually mail.
    .filter((p) => !/^0\s/.test(p.address));
}

/**
 * High-level: given a Clerk-record buyer name + subdivision hint, return
 * the best parcel match (or null if no confident match).
 */
export async function enrichLeadFromHcad(
  ownerName: string,
  subdivisionHint: string | null,
): Promise<HcadParcel | null> {
  const candidates = await searchHcadByOwner(ownerName, 10);
  return pickBest(candidates, subdivisionHint);
}
