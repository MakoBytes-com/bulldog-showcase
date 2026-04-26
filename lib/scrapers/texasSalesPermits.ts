/**
 * Texas New Sales Tax Permits scraper.
 *
 * Source: data.texas.gov Socrata dataset `np34-wmxb`
 *   "New Sales Tax Permits issued last 7 days"
 *   https://data.texas.gov/Government-and-Taxes/New-Sales-Tax-Permits-issued-last-7-days/np34-wmxb/data
 *
 * Free, no API key, no scraping — clean JSON via the SODA endpoint at
 *   https://data.texas.gov/resource/np34-wmxb.json
 *
 * Each row is one OUTLET of a business that just received a Texas
 * sales tax permit. Includes:
 *   - taxpayer_number (legal entity ID)
 *   - taxpayer_name (legal name)
 *   - outlet_number (per-outlet sequence)
 *   - outlet_name (storefront/DBA name)
 *   - outlet_address / city / state / zip (PHYSICAL address)
 *   - outlet_permit_issue_date
 *   - outlet_first_sales_date
 *   - taxpayer_county_code (FIPS — Harris=101)
 *
 * For Bulldog's Houston-area service zone we filter to a Texas zip
 * range that covers the metro and rings out a couple of counties.
 * Each row becomes a sales_leads row with source='business-filing'.
 */

import "server-only";

const ENDPOINT = "https://data.texas.gov/resource/np34-wmxb.json";

// Houston metro service area: Harris + ring counties' zip prefixes.
// 770-778 covers Houston, Fort Bend, Montgomery, Galveston, Brazoria,
// Waller, Liberty, Chambers, San Jacinto. Easy first cut; can be
// tuned per-zip later in the panel.
const HOUSTON_AREA_ZIP_PREFIXES = [
  "770",
  "771",
  "772",
  "773",
  "774",
  "775",
  "776",
  "777",
  "778",
];

export type TxPermit = {
  taxpayerNumber: string;
  taxpayerName: string;
  outletNumber: string;
  outletName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  permitIssueDate: string; // YYYY-MM-DD
  firstSalesDate: string | null;
  countyCode: string | null;
};

type SocrataRecord = {
  taxpayer_number?: string;
  taxpayer_name?: string;
  outlet_number?: string;
  outlet_name?: string;
  outlet_address?: string;
  outlet_city?: string;
  outlet_state?: string;
  outlet_zip_code?: string;
  outlet_permit_issue_date?: string;
  outlet_first_sales_date?: string;
  taxpayer_county_code?: string;
};

function isHoustonAreaZip(zip: string | undefined): boolean {
  if (!zip) return false;
  const trimmed = zip.trim().slice(0, 3);
  return HOUSTON_AREA_ZIP_PREFIXES.includes(trimmed);
}

/**
 * Pull every Houston-metro permit issued on or after `since`. Socrata
 * caps SODA responses at 50,000 rows by default — way more than the
 * daily volume we're filtering down to.
 */
export async function fetchTexasNewPermits(opts: {
  since: Date;
  limit?: number;
}): Promise<TxPermit[]> {
  const { since, limit = 1000 } = opts;
  const sinceIso = since.toISOString().slice(0, 19) + ".000";

  const params = new URLSearchParams({
    "$select":
      "taxpayer_number,taxpayer_name,outlet_number,outlet_name,outlet_address,outlet_city,outlet_state,outlet_zip_code,outlet_permit_issue_date,outlet_first_sales_date,taxpayer_county_code",
    "$where": `outlet_permit_issue_date >= '${sinceIso}' AND outlet_state = 'TX'`,
    "$order": "outlet_permit_issue_date DESC",
    "$limit": String(limit),
  });

  const resp = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`TX permits HTTP ${resp.status}: ${body.slice(0, 200)}`);
  }
  const rows = (await resp.json()) as SocrataRecord[];

  return rows
    .filter((r) => isHoustonAreaZip(r.outlet_zip_code))
    .filter((r) => r.outlet_address && r.outlet_name && r.taxpayer_number)
    .map((r) => ({
      taxpayerNumber: r.taxpayer_number ?? "",
      taxpayerName: r.taxpayer_name ?? "",
      outletNumber: r.outlet_number ?? "0",
      outletName: r.outlet_name ?? r.taxpayer_name ?? "",
      address: r.outlet_address ?? "",
      city: r.outlet_city ?? "",
      state: r.outlet_state ?? "TX",
      zip: r.outlet_zip_code ?? "",
      permitIssueDate: (r.outlet_permit_issue_date ?? "").slice(0, 10),
      firstSalesDate: r.outlet_first_sales_date
        ? r.outlet_first_sales_date.slice(0, 10)
        : null,
      countyCode: r.taxpayer_county_code ?? null,
    }));
}
