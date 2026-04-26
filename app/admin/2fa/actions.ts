"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getSession } from "@/lib/auth/session";
import { findUserById, recordLogin } from "@/lib/auth/users";
import {
  consumeRecoveryCode,
  decryptTotpSecret,
  verifyTotp,
} from "@/lib/auth/totp";
import {
  checkLoginRateLimit,
  clearEmailRateLimit,
} from "@/lib/auth/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";

const MIN_FAIL_MS = 800;
const GENERIC_ERROR = "Invalid code. Please try again.";

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

export async function verifyOtpAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const startedAt = Date.now();
  const session = await getSession();

  if (
    !session.pendingUserId ||
    !session.pendingEmail ||
    !session.pendingExpiresAt ||
    session.pendingExpiresAt < Date.now()
  ) {
    // Pending state is missing or stale; send them back to login.
    session.destroy();
    redirect("/admin/login");
  }

  const code = String(formData.get("code") ?? "").trim();
  const useRecovery = formData.get("use_recovery") === "1";
  const next = String(formData.get("next") ?? "/admin");
  const captchaToken = String(formData.get("cf-turnstile-response") ?? "");

  if (!code) return failWithDelay(startedAt, GENERIC_ERROR);

  const ip = await getClientIp();
  const rate = await checkLoginRateLimit(ip, session.pendingEmail);
  if (!rate.allowed) {
    return failWithDelay(startedAt, rate.reason ?? GENERIC_ERROR);
  }

  // Same bot defense as the password step. Even with rate limits in
  // place, automated OTP guessing without solving a challenge is
  // exactly the attack we want to make expensive.
  const captcha = await verifyTurnstile(captchaToken, ip);
  if (!captcha.ok) {
    return failWithDelay(startedAt, captcha.reason);
  }

  const user = await findUserById(session.pendingUserId);
  if (!user || !user.totpSecret || user.disabledAt) {
    session.destroy();
    return failWithDelay(
      startedAt,
      "Session expired. Please sign in again.",
    );
  }

  let accepted = false;
  if (useRecovery) {
    accepted = await consumeRecoveryCode(user.id, code);
  } else {
    try {
      const secret = decryptTotpSecret(user.totpSecret);
      accepted = verifyTotp(secret, code);
    } catch {
      accepted = false;
    }
  }

  if (!accepted) {
    return failWithDelay(startedAt, GENERIC_ERROR);
  }

  await clearEmailRateLimit(session.pendingEmail);

  // Promote pending → full session.
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

