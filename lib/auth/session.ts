/**
 * iron-session configuration for Makopanel. Session data lives in a
 * signed, encrypted cookie — no DB round-trip per request. Stateless
 * and fast. Rotating SESSION_SECRET invalidates every session.
 */

import "server-only";

import type { SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type Role = "admin" | "editor";

export interface MakoSession {
  userId?: number;
  email?: string;
  name?: string;
  role?: Role;

  // Set after password check succeeds for a user with 2FA enabled.
  // Session is NOT fully authenticated until userId is set (via the
  // /admin/2fa verify step). Expires shortly so a stolen pending
  // cookie can't sit around indefinitely waiting for an OTP.
  pendingUserId?: number;
  pendingEmail?: string;
  pendingExpiresAt?: number; // epoch ms
}

const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("SESSION_SECRET env var is not set");
}

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: "mako_session",
  cookieOptions: {
    httpOnly: true,
    // Always secure — admin panel is HTTPS-only in every environment.
    // Don't gate by NODE_ENV; if Mako Admin ever runs an HTTP staging it
    // shouldn't silently downgrade auth cookies.
    secure: true,
    sameSite: "lax",
    path: "/",
    // 24 hours — admin re-auth daily. Shorter window caps blast radius
    // if an unlocked browser is left unattended at the desk. Mako Admin's
    // workflow is "log in, work, close laptop"; one login per day is fine.
    maxAge: 60 * 60 * 24,
  },
};

export async function getSession() {
  return getIronSession<MakoSession>(await cookies(), sessionOptions);
}
