/**
 * Shared gatekeeping for /api/pv and /api/event.
 *
 * Two checks:
 *   1. `isbot(userAgent)` — filters Googlebot, Bingbot, AhrefsBot, etc.
 *      Bots are dropped before DB insert so the dashboard reflects real
 *      human traffic.
 *   2. IP blocklist from ANALYTICS_IP_BLOCKLIST env (comma-separated).
 *      Useful for silencing your own office IP or a scraper.
 *
 * Geo enrichment (country) is read from Vercel's request headers
 * (`x-vercel-ip-country`). Free, no MaxMind license required. Falls back
 * to null locally.
 */
import { isbot } from "isbot";

const blockedIps = new Set(
  (process.env.ANALYTICS_IP_BLOCKLIST || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

export type RequestMeta = {
  userAgent: string;
  ip: string | null;
  country: string | null;
  referrer: string | null;
};

export function readMeta(req: Request): RequestMeta {
  const h = req.headers;
  const ip =
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    null;

  return {
    userAgent: h.get("user-agent") || "",
    ip: ip || null,
    country: h.get("x-vercel-ip-country") || null,
    referrer: h.get("referer") || null,
  };
}

export function shouldAccept(meta: RequestMeta): boolean {
  if (!meta.userAgent) return false; // no UA = probably curl/scraper
  if (isbot(meta.userAgent)) return false;
  if (meta.ip && blockedIps.has(meta.ip)) return false;
  return true;
}
