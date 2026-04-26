"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { findUserById, updateUser } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/auth/passwords";
import {
  clearTotpAndRecoveryCodes,
  decryptTotpSecret,
  encryptTotpSecret,
  generateAndStoreRecoveryCodes,
  setUserTotp,
  verifyTotp,
} from "@/lib/auth/totp";

async function requireSelf() {
  const session = await getSession();
  if (!session.userId) throw new Error("Not signed in.");
  const user = await findUserById(session.userId);
  if (!user || user.disabledAt) throw new Error("Account unavailable.");
  return user;
}

export async function changeOwnPasswordAction(
  _prev: { error: string | null; ok: boolean },
  formData: FormData,
): Promise<{ error: string | null; ok: boolean }> {
  const user = await requireSelf();

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!user.passwordHash) {
    return { error: "No password is set on this account.", ok: false };
  }
  const valid = await verifyPassword(current, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect.", ok: false };
  if (next.length < 10) {
    return { error: "New password must be at least 10 characters.", ok: false };
  }
  if (next !== confirm) {
    return { error: "New password and confirmation do not match.", ok: false };
  }
  await updateUser(user.id, { password: next });
  revalidatePath("/admin/profile");
  return { error: null, ok: true };
}

// ── 2FA ───────────────────────────────────────────────────────────────

/**
 * Confirms enrollment: verifies the first OTP against the secret we
 * generated on the page, encrypts + stores it, creates recovery
 * codes, returns them once so the client can show them.
 */
export type EnrollmentResult = {
  error: string | null;
  recoveryCodes?: string[];
};

export async function enrollTotpAction(
  _prev: EnrollmentResult,
  formData: FormData,
): Promise<EnrollmentResult> {
  const user = await requireSelf();

  if (user.totpEnrolledAt) {
    return { error: "2FA is already enabled. Disable it first to re-enroll." };
  }

  const secret = String(formData.get("secret") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const current = String(formData.get("current_password") ?? "");

  if (!secret || !code) {
    return { error: "Missing secret or verification code." };
  }
  if (!user.passwordHash) {
    return { error: "No password is set on this account." };
  }
  const pwOk = await verifyPassword(current, user.passwordHash);
  if (!pwOk) return { error: "Current password is incorrect." };

  if (!verifyTotp(secret, code)) {
    return { error: "That code didn't match. Check your app and try again." };
  }

  const encrypted = encryptTotpSecret(secret);
  await setUserTotp(user.id, encrypted);
  const recoveryCodes = await generateAndStoreRecoveryCodes(user.id);

  revalidatePath("/admin/profile");
  return { error: null, recoveryCodes };
}

export async function disableTotpAction(
  _prev: { error: string | null; ok: boolean },
  formData: FormData,
): Promise<{ error: string | null; ok: boolean }> {
  const user = await requireSelf();

  if (!user.totpEnrolledAt || !user.totpSecret) {
    return { error: "2FA is not currently enabled on this account.", ok: false };
  }

  const current = String(formData.get("current_password") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!user.passwordHash) {
    return { error: "No password is set on this account.", ok: false };
  }
  const pwOk = await verifyPassword(current, user.passwordHash);
  if (!pwOk) return { error: "Current password is incorrect.", ok: false };

  let otpOk = false;
  try {
    const secret = decryptTotpSecret(user.totpSecret);
    otpOk = verifyTotp(secret, code);
  } catch {
    otpOk = false;
  }
  if (!otpOk) {
    return {
      error: "The verification code didn't match. Disabling requires a valid code from your app.",
      ok: false,
    };
  }

  await clearTotpAndRecoveryCodes(user.id);
  revalidatePath("/admin/profile");
  return { error: null, ok: true };
}

export async function regenerateRecoveryCodesAction(
  _prev: { error: string | null; codes?: string[] },
  formData: FormData,
): Promise<{ error: string | null; codes?: string[] }> {
  const user = await requireSelf();

  if (!user.totpEnrolledAt) {
    return { error: "Enable 2FA first." };
  }

  const current = String(formData.get("current_password") ?? "");
  if (!user.passwordHash) {
    return { error: "No password is set on this account." };
  }
  const pwOk = await verifyPassword(current, user.passwordHash);
  if (!pwOk) return { error: "Current password is incorrect." };

  const codes = await generateAndStoreRecoveryCodes(user.id);
  revalidatePath("/admin/profile");
  return { error: null, codes };
}
