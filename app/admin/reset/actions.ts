"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import {
  clearResetToken,
  findUserByResetToken,
} from "@/lib/auth/passwordReset";
import { updateUser } from "@/lib/auth/users";
import {
  checkLoginRateLimit,
  clearEmailRateLimit,
} from "@/lib/auth/rateLimit";

const MIN_FAIL_MS = 800;

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function failWithDelay(
  startedAt: number,
  error: string,
): Promise<{ error: string | null; ok: boolean }> {
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_FAIL_MS) {
    await new Promise((r) => setTimeout(r, MIN_FAIL_MS - elapsed));
  }
  return { error, ok: false };
}

export async function consumeResetTokenAction(
  _prev: { error: string | null; ok: boolean },
  formData: FormData,
): Promise<{ error: string | null; ok: boolean }> {
  const startedAt = Date.now();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) {
    return failWithDelay(startedAt, "Missing or invalid reset token.");
  }
  if (password.length < 10) {
    return failWithDelay(
      startedAt,
      "New password must be at least 10 characters.",
    );
  }
  if (password !== confirm) {
    return failWithDelay(startedAt, "Passwords do not match.");
  }

  const ip = await getClientIp();
  // Rate-limit the consume endpoint by IP to slow token-guessing.
  const rate = await checkLoginRateLimit(ip, "_pwreset_consume");
  if (!rate.allowed) {
    return failWithDelay(
      startedAt,
      rate.reason ?? "Too many attempts. Please wait and try again.",
    );
  }

  const user = await findUserByResetToken(token);
  if (!user || user.disabledAt) {
    return failWithDelay(
      startedAt,
      "This reset link is invalid or has expired. Request a new one.",
    );
  }

  await updateUser(user.id, { password });
  await clearResetToken(user.id);
  // Reset still requires the user to sign in — and if they have 2FA,
  // they'll be prompted for it. Resetting a password does not bypass
  // 2FA. Clear any login-attempt counter for the email so they aren't
  // immediately rate-limited.
  await clearEmailRateLimit(user.email);

  // Redirect to login with a hint flag the form can read.
  redirect("/admin/login?reset=ok");
}
