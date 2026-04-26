/**
 * Password reset tokens.
 *
 * - Tokens are 32 random bytes, base64url-encoded for the URL.
 * - Only the SHA-256 hash is stored in the DB. A DB leak therefore
 *   doesn't grant attackers the ability to mint resets.
 * - Single-use: the row is cleared on consumption.
 * - 1-hour expiry.
 * - Per-user min interval (60s) between requests so the form can't
 *   be used to spam someone's inbox.
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";

import { db, schema } from "@/lib/db";

export const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const MIN_INTERVAL_MS = 60 * 1000; //   1 minute between requests per user

export interface IssuedToken {
  /** Plaintext token to put in the URL — never stored. */
  token: string;
  /** Timestamp the token expires at. */
  expiresAt: Date;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate + persist a reset token for the given user. Returns the
 * plaintext token so the caller can email it. The previous token (if
 * any) is overwritten — only one outstanding reset per user.
 */
export async function issueResetToken(
  userId: number,
): Promise<IssuedToken | null> {
  // Per-user request rate limit so we don't get used as an email
  // spammer for someone's inbox.
  const rows = await db
    .select({
      requestedAt: schema.users.passwordResetRequestedAt,
    })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  const last = rows[0]?.requestedAt;
  if (
    last instanceof Date &&
    Date.now() - last.getTime() < MIN_INTERVAL_MS
  ) {
    return null;
  }

  const raw = randomBytes(32);
  const token = b64url(raw);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db
    .update(schema.users)
    .set({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
      passwordResetRequestedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));

  return { token, expiresAt };
}

/**
 * Look up the user owning a still-valid reset token. Returns null
 * if the token is missing, expired, or no longer matches the user
 * who requested it (e.g. consumed already).
 */
export async function findUserByResetToken(token: string) {
  if (!token || typeof token !== "string" || token.length < 32) return null;
  const tokenHash = hashToken(token);
  const now = new Date();

  // We could SELECT WHERE token_hash = X but timing-safe compare is
  // pickier; pull all candidates by exact hash and compare in JS.
  const rows = await db
    .select()
    .from(schema.users)
    .where(
      and(
        eq(schema.users.passwordResetTokenHash, tokenHash),
        gt(schema.users.passwordResetExpiresAt, now),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row || !row.passwordResetTokenHash) return null;

  // Defense in depth: timing-safe compare.
  const a = Buffer.from(row.passwordResetTokenHash, "hex");
  const b = Buffer.from(tokenHash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return row;
}

export async function clearResetToken(userId: number) {
  await db
    .update(schema.users)
    .set({
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      passwordResetRequestedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));
}

/** Build the absolute reset URL for a given token. */
export function buildResetUrl(token: string, origin: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/admin/reset?token=${encodeURIComponent(token)}`;
}
