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

// SESSION_SECRET deferred to use-time (see lib/db/index.ts for full
// rationale). iron-session needs >=32-char password — placeholder is
// long enough.
const SECRET_PLACEHOLDER = "__SESSION_SECRET_NOT_SET_BUILD_TIME_ONLY_PLACEHOLDER_DO_NOT_USE__";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? SECRET_PLACEHOLDER,
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
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET env var is not set");
  }
  return getIronSession<MakoSession>(await cookies(), sessionOptions);
}
