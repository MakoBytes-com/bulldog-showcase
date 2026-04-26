"use server";

import { headers } from "next/headers";

import { findUserByEmail } from "@/lib/auth/users";
import { issueResetToken, buildResetUrl } from "@/lib/auth/passwordReset";
import { sendResetEmail } from "@/lib/auth/resetEmail";
import { logError } from "@/lib/log";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkLoginRateLimit } from "@/lib/auth/rateLimit";

const MIN_RESPONSE_MS = 800;
const GENERIC_OK_MESSAGE =
  "If an account exists for that email, we've sent a reset link. Check your inbox (and spam folder) within a minute or two.";

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "https";
  const host = h.get("host") || "bulldogsecurityservice.com";
  return `${proto}://${host}`;
}

async function settle(
  startedAt: number,
  result: { error: string | null; sent: boolean },
) {
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_RESPONSE_MS) {
    await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
  }
  return result;
}

export async function requestPasswordResetAction(
  _prev: { error: string | null; sent: boolean },
  formData: FormData,
): Promise<{ error: string | null; sent: boolean }> {
  const startedAt = Date.now();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("cf-turnstile-response") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return settle(startedAt, {
      error: "Enter the email address on your account.",
      sent: false,
    });
  }

  const ip = await getClientIp();

  // Same per-IP / per-email rate limiter as /admin/login. Prevents
  // attackers from spamming the form to enumerate accounts via timing
  // or burn the per-user 60s anti-spam window.
  const rate = await checkLoginRateLimit(ip, email);
  if (!rate.allowed) {
    return settle(startedAt, {
      error:
        rate.reason ??
        "Too many requests. Please wait a few minutes and try again.",
      sent: false,
    });
  }

  const captcha = await verifyTurnstile(token, ip);
  if (!captcha.ok) {
    return settle(startedAt, {
      error: captcha.reason,
      sent: false,
    });
  }

  // Always return the same generic success message regardless of
  // whether the account exists. No enumeration via this endpoint.
  const user = await findUserByEmail(email);
  if (user && !user.disabledAt) {
    const issued = await issueResetToken(user.id);
    if (issued) {
      const origin = await getOrigin();
      const url = buildResetUrl(issued.token, origin);
      try {
        await sendResetEmail({
          to: user.email,
          name: user.name,
          url,
        });
      } catch (err) {
        logError("forgot", "sendResetEmail threw", err);
      }
    }
  }

  return settle(startedAt, { error: null, sent: true });
}
