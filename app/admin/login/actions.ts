"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getSession } from "@/lib/auth/session";
import { findUserByEmail, recordLogin } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/auth/passwords";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  checkLoginRateLimit,
  clearEmailRateLimit,
} from "@/lib/auth/rateLimit";

// Minimum time any failed login takes to return, to flatten timing
// side-channels and slow brute-force. 800 ms is long enough to hurt
// attackers without being visibly annoying to humans.
const MIN_FAIL_MS = 800;
const GENERIC_ERROR = "Invalid email or password.";

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function failWithDelay(
  startedAt: number,
  error: string,
): Promise<{ error: string }> {
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_FAIL_MS) {
    await new Promise((r) => setTimeout(r, MIN_FAIL_MS - elapsed));
  }
  return { error };
}

export async function loginAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const startedAt = Date.now();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const honeypot = String(formData.get("company_website") ?? "").trim();
  const token = String(formData.get("cf-turnstile-response") ?? "");

  // Honeypot — if anything is in this field, it's a bot. Burn the
  // standard fail-delay and return the generic error.
  if (honeypot) {
    return failWithDelay(startedAt, GENERIC_ERROR);
  }

  if (!email || !password) {
    return failWithDelay(startedAt, "Email and password are required.");
  }

  const ip = await getClientIp();

  // Rate-limit by IP + email BEFORE doing any real work.
  const rate = await checkLoginRateLimit(ip, email);
  if (!rate.allowed) {
    return failWithDelay(startedAt, rate.reason ?? GENERIC_ERROR);
  }

  // Turnstile verification (dormant in dev if TURNSTILE_SECRET_KEY unset).
  const captcha = await verifyTurnstile(token, ip);
  if (!captcha.ok) {
    return failWithDelay(startedAt, captcha.reason);
  }

  const user = await findUserByEmail(email);

  // Use same message / same delay whether user exists or not — no
  // user-enumeration side channel via error text or timing.
  if (!user || !user.passwordHash || user.disabledAt) {
    return failWithDelay(startedAt, GENERIC_ERROR);
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return failWithDelay(startedAt, GENERIC_ERROR);
  }

  // Success path — clear the per-email counter so one mistyped
  // password doesn't eat into the attacker-targeted limit.
  await clearEmailRateLimit(email);

  const session = await getSession();

  // If the user has TOTP enrolled, hold the session in a "pending"
  // state until they complete the 6-digit challenge at /admin/2fa.
  // userId stays unset — middleware + panel layout will bounce them
  // back to the 2FA screen, not to the dashboard.
  if (user.totpSecret && user.totpEnrolledAt) {
    session.userId = undefined;
    session.email = undefined;
    session.name = undefined;
    session.role = undefined;
    session.pendingUserId = user.id;
    session.pendingEmail = user.email;
    session.pendingExpiresAt = Date.now() + 5 * 60 * 1000; // 5 min
    await session.save();
    const safeNext = next.startsWith("/admin") ? next : "/admin";
    redirect(`/admin/2fa?next=${encodeURIComponent(safeNext)}`);
  }

  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  session.role = user.role as "admin" | "editor";
  session.pendingUserId = undefined;
  session.pendingEmail = undefined;
  session.pendingExpiresAt = undefined;
  await session.save();

  await recordLogin(user.id);

  const safeNext = next.startsWith("/admin") ? next : "/admin";
  redirect(safeNext);
}
