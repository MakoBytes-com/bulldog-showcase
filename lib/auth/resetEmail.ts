/**
 * Branded password-reset email — sent via Resend. Logs and returns
 * silently if Resend isn't configured (e.g. local dev).
 */

import { Resend } from "resend";

import { logError, logWarn } from "@/lib/log";

const FROM_DEFAULT = "info@bdsnation.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function html(name: string, url: string): string {
  const safeName = esc(name);
  const safeUrl = esc(url);
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0b1a2e;color:#cfd9e5">
  <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff">Reset your Bulldog Security admin password</h1>
  <p style="margin:0 0 14px;font-size:15px;line-height:1.5">Hi ${safeName},</p>
  <p style="margin:0 0 14px;font-size:15px;line-height:1.5">Someone (hopefully you) requested a password reset for your <strong style="color:#ffffff">Bulldog Security admin</strong> account.</p>
  <p style="margin:24px 0;text-align:center">
    <a href="${safeUrl}" style="display:inline-block;background:#006fb9;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">Set a new password</a>
  </p>
  <p style="margin:0 0 14px;font-size:13px;color:#9fb0c7;line-height:1.5">Or paste this link into your browser:</p>
  <p style="margin:0 0 18px;font-size:12px;color:#9fb0c7;word-break:break-all"><a href="${safeUrl}" style="color:#5ab3eb">${safeUrl}</a></p>
  <hr style="border:none;border-top:1px solid #1d3554;margin:24px 0"/>
  <p style="margin:0 0 8px;font-size:13px;color:#9fb0c7;line-height:1.5">This link expires in 1 hour and can only be used once.</p>
  <p style="margin:0;font-size:13px;color:#9fb0c7;line-height:1.5">If you didn't request this, you can ignore this email — your password won't change.</p>
</div>`;
}

function text(name: string, url: string): string {
  return `Reset your Bulldog Security admin password

Hi ${name},

Someone (hopefully you) requested a password reset for your Bulldog Security admin account.

Set a new password by opening this link:
${url}

This link expires in 1 hour and can only be used once.

If you didn't request this, you can ignore this email — your password won't change.

— Bulldog Security Service`;
}

export async function sendResetEmail(opts: {
  to: string;
  name: string;
  url: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL || FROM_DEFAULT;

  if (!apiKey) {
    logWarn(
      "passwordReset",
      "RESEND_API_KEY not set — email not actually sent.",
      { to: opts.to, url: opts.url },
    );
    return { ok: false, error: "email service not configured" };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Bulldog Security Admin <${from}>`,
      to: [opts.to],
      subject: "Reset your Bulldog Security admin password",
      html: html(opts.name || opts.to, opts.url),
      text: text(opts.name || opts.to, opts.url),
    });
    return { ok: true };
  } catch (err) {
    logError("passwordReset", "resend.send failed", err);
    return { ok: false, error: "send failed" };
  }
}
