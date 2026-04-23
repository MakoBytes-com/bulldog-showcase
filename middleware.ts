import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

// Brute-force defense. Per-IP sliding window.
// 5 failed auth attempts in 15 minutes → 401s get swapped for 429 lockout
// for the remainder of the window. State lives in the serverless instance
// memory — not distributed, but sufficient deterrent: an attacker would
// have to rotate IPs faster than bucket expiry to make progress against
// a 16-char random password (which is already uncrackable in any
// reasonable timeframe).
const FAIL_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const FAILS = new Map<string, number[]>();

function recordFailure(ip: string) {
  const now = Date.now();
  const arr = (FAILS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  FAILS.set(ip, arr);
}

function currentFailures(ip: string): number[] {
  const now = Date.now();
  const arr = (FAILS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  FAILS.set(ip, arr);
  return arr;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Protect /admin and all sub-paths with HTTP Basic Auth + per-IP rate limiting.
 * Credentials come from ADMIN_USER + ADMIN_PASSWORD Vercel env vars.
 * Uses constant-time comparison to resist timing attacks.
 */
export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  // If credentials aren't configured, block access entirely rather than
  // failing open. The admin area must never be reachable without auth.
  if (!expectedUser || !expectedPass) {
    return new NextResponse(
      "Admin area is not configured. Set ADMIN_USER and ADMIN_PASSWORD.",
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  const failures = currentFailures(ip);

  // Hard lock-out if this IP has already burned through the limit
  if (failures.length >= FAIL_LIMIT) {
    const oldest = failures[0];
    const retryAfterSec = Math.ceil((WINDOW_MS - (Date.now() - oldest)) / 1000);
    return new NextResponse(
      "Too many failed login attempts. Try again later.",
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("basic ")) {
    const decoded = atob(auth.slice(6));
    const idx = decoded.indexOf(":");
    if (idx !== -1) {
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (timingSafeEqual(user, expectedUser) && timingSafeEqual(pass, expectedPass)) {
        // Successful login — clear the failure counter for this IP
        FAILS.delete(ip);
        return NextResponse.next();
      }
      // Wrong credentials submitted — count it
      recordFailure(ip);
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Bulldog Security Admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

/** Constant-time string comparison. Avoids leaking length via early exit. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still run the loop to mask the difference
    let diff = 1;
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false && diff === 0;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
