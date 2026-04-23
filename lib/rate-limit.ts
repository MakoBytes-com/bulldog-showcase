// Lightweight per-IP rate limiter for the contact form Server Action.
// Not a distributed limiter — runs in the serverless function's memory.
// That's fine here: the goal is to blunt casual abuse. Cloudflare Turnstile
// is the primary bot gate; this is a secondary bucket so one bad actor
// can't run a resend-budget or email-bomb attack even if they bypass
// Turnstile somehow.

const BUCKETS = new Map<string, number[]>();

export type RateLimitOptions = {
  /** Max number of allowed hits inside the window */
  limit: number;
  /** Window in milliseconds */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

/** Drop timestamps older than the window. */
function prune(key: string, now: number, windowMs: number): number[] {
  const arr = BUCKETS.get(key) ?? [];
  const kept = arr.filter((t) => now - t < windowMs);
  if (kept.length !== arr.length) BUCKETS.set(key, kept);
  return kept;
}

export function rateLimit(
  key: string,
  opts: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = prune(key, now, opts.windowMs);
  if (bucket.length >= opts.limit) {
    const resetMs = opts.windowMs - (now - bucket[0]);
    return { allowed: false, remaining: 0, resetMs };
  }
  bucket.push(now);
  BUCKETS.set(key, bucket);
  return {
    allowed: true,
    remaining: opts.limit - bucket.length,
    resetMs: opts.windowMs,
  };
}
