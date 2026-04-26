/**
 * DB-backed (multi-instance-safe) rate limiter. Each attempt is a row
 * in `rate_limit_attempts`; checks count rows in the window. Replaces
 * the previous in-memory Map limiter which was bypassable on a
 * multi-instance deploy by distributing attempts across cold starts.
 *
 * Performance: each check = one COUNT + (if allowed) one INSERT. Both
 * indexed on (bucket_key, occurred_at). Cheap relative to the actual
 * work being protected (login bcrypt verify, contact form Resend send,
 * Vercel Blob upload).
 *
 * Pruning: a small probabilistic cleanup on every check deletes rows
 * that fall outside the longest-relevant window (24 hours).
 */

import "server-only";

import { neon } from "@neondatabase/serverless";
import { logError } from "@/lib/log";

const connectionString = process.env.DATABASE_URI;
if (!connectionString) {
  throw new Error("DATABASE_URI is not set");
}
const sql = neon(connectionString);

const PRUNE_PROBABILITY = 0.01; // 1% of checks trigger a window-wide prune
const PRUNE_OLDER_THAN_MS = 24 * 60 * 60 * 1000; // 24 hours

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

/**
 * Check if a bucket has remaining capacity, and if so record an attempt.
 * Fail-open on DB errors (logged) — better to accept a request than to
 * lock everyone out if Neon is briefly unreachable.
 */
export async function checkRateLimit({
  key,
  windowMs,
  max,
}: {
  key: string;
  windowMs: number;
  max: number;
}): Promise<RateLimitResult> {
  try {
    const cutoff = new Date(Date.now() - windowMs);

    const rows = await sql`
      SELECT COUNT(*)::int AS n,
             MIN(occurred_at) AS oldest
      FROM rate_limit_attempts
      WHERE bucket_key = ${key}
        AND occurred_at > ${cutoff.toISOString()}::timestamptz
    ` as Array<{ n: number; oldest: string | null }>;

    const used = rows[0]?.n ?? 0;
    if (used >= max) {
      const oldestMs = rows[0]?.oldest ? new Date(rows[0].oldest).getTime() : Date.now();
      return {
        allowed: false,
        remaining: 0,
        resetMs: Math.max(0, oldestMs + windowMs - Date.now()),
      };
    }

    await sql`
      INSERT INTO rate_limit_attempts (bucket_key) VALUES (${key})
    `;

    if (Math.random() < PRUNE_PROBABILITY) {
      const pruneCutoff = new Date(Date.now() - PRUNE_OLDER_THAN_MS);
      // Fire-and-forget — don't block the caller on cleanup.
      void sql`
        DELETE FROM rate_limit_attempts
        WHERE occurred_at < ${pruneCutoff.toISOString()}::timestamptz
      `.catch(() => {
        // best-effort prune
      });
    }

    return { allowed: true, remaining: max - used - 1, resetMs: windowMs };
  } catch (err) {
    logError("rateLimit", "DB rate-limit check failed; failing open", err);
    return { allowed: true, remaining: max, resetMs: windowMs };
  }
}

/** Drop a bucket entirely. Used on successful login to avoid locking
 * out users who mistyped their password once. */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    await sql`DELETE FROM rate_limit_attempts WHERE bucket_key = ${key}`;
  } catch (err) {
    logError("rateLimit", "DB rate-limit clear failed", err);
  }
}

// ─── Login rate-limit policy + helpers (preserved API) ──────────────

export const LOGIN_RL = {
  IP_WINDOW_MS: 15 * 60 * 1000,
  IP_MAX: 10,
  EMAIL_WINDOW_MS: 15 * 60 * 1000,
  EMAIL_MAX: 5,
};

export async function checkLoginRateLimit(
  ip: string,
  email: string,
): Promise<{ allowed: boolean; reason?: string; retryAfterSec?: number }> {
  const byIp = await checkRateLimit({
    key: `login:ip:${ip}`,
    windowMs: LOGIN_RL.IP_WINDOW_MS,
    max: LOGIN_RL.IP_MAX,
  });
  if (!byIp.allowed) {
    return {
      allowed: false,
      reason:
        "Too many sign-in attempts from this network. Try again in a few minutes.",
      retryAfterSec: Math.ceil(byIp.resetMs / 1000),
    };
  }

  if (email) {
    const byEmail = await checkRateLimit({
      key: `login:email:${email.toLowerCase()}`,
      windowMs: LOGIN_RL.EMAIL_WINDOW_MS,
      max: LOGIN_RL.EMAIL_MAX,
    });
    if (!byEmail.allowed) {
      return {
        allowed: false,
        reason:
          "Too many sign-in attempts for this account. Try again in a few minutes.",
        retryAfterSec: Math.ceil(byEmail.resetMs / 1000),
      };
    }
  }

  return { allowed: true };
}

/** Clears the per-email counter after a successful login. */
export async function clearEmailRateLimit(email: string): Promise<void> {
  await clearRateLimit(`login:email:${email.toLowerCase()}`);
}
