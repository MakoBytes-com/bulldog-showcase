import { logError, logWarn } from "@/lib/log";

export type TurnstileResult =
  | { ok: true; dormant?: boolean }
  | { ok: false; reason: string; codes?: string[] };

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

/**
 * Verify a Cloudflare Turnstile token server-side.
 *
 * In production, TURNSTILE_SECRET_KEY MUST be set — fail closed if it
 * isn't, so a missing env var doesn't silently disable bot protection
 * on contact form / login. In dev (NODE_ENV !== "production"), keep
 * the dormant fallback so local work isn't blocked.
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  ip: string
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      logError(
        "turnstile",
        "TURNSTILE_SECRET_KEY missing in production — failing closed",
      );
      return {
        ok: false,
        reason: "Bot protection is misconfigured. Please contact support.",
      };
    }
    logWarn(
      "turnstile",
      "TURNSTILE_SECRET_KEY not set — skipping verification (dormant, dev only)."
    );
    return { ok: true, dormant: true };
  }

  if (!token) {
    return { ok: false, reason: "Please complete the verification challenge." };
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data: { success?: boolean; "error-codes"?: string[] } = await res.json();
    if (data.success) return { ok: true };
    return {
      ok: false,
      reason: "Verification failed. Please try again.",
      codes: data["error-codes"],
    };
  } catch (err) {
    logError("turnstile", "verify error", err);
    return { ok: false, reason: "Verification service unavailable." };
  }
}
