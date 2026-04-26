/**
 * Fetch the ScrapingBee account's current credit usage. Used by the
 * Sales overview to show "X / 1000 credits used this month" so it's
 * obvious the integration is live and economical.
 *
 * Endpoint: https://app.scrapingbee.com/api/v1/usage?api_key=...
 * Returns:
 *   {
 *     "max_api_credit": 1000,
 *     "used_api_credit": 240,
 *     "max_concurrency": 5,
 *     "current_concurrency": 0
 *   }
 */

import "server-only";

export type ScrapingBeeUsage = {
  used: number;
  max: number;
  remaining: number;
};

export async function fetchScrapingBeeUsage(): Promise<ScrapingBeeUsage | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch(
      `https://app.scrapingbee.com/api/v1/usage?api_key=${apiKey}`,
      { cache: "no-store" },
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      max_api_credit?: number;
      used_api_credit?: number;
    };
    const used = data.used_api_credit ?? 0;
    const max = data.max_api_credit ?? 0;
    return { used, max, remaining: Math.max(0, max - used) };
  } catch {
    return null;
  }
}
