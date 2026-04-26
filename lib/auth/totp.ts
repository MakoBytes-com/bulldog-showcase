/**
 * TOTP helpers: enroll, verify, recovery codes.
 *
 * Uses otplib v13's functional API (generateSecret / generateURI /
 * verifySync). Secrets are stored encrypted via secretCrypto; the raw
 * base32 only exists in memory during enrollment.
 */

import { generateSecret, generateURI, verifySync } from "otplib";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import qrcode from "qrcode";

import { db, schema } from "@/lib/db";
import { decryptSecret, encryptSecret } from "./secretCrypto";

const ISSUER = "Bulldog Security Admin";
const RECOVERY_CODE_COUNT = 10;
// 30 s epoch tolerance symmetric (±1 step) — absorbs clock skew without
// widening the replay window too much.
const EPOCH_TOLERANCE_SEC = 30;

export function generateTotpSecret(): string {
  return generateSecret();
}

export function buildOtpAuthUrl(email: string, secret: string): string {
  return generateURI({
    issuer: ISSUER,
    label: email,
    secret,
  });
}

export async function buildQrDataUrl(email: string, secret: string) {
  const uri = buildOtpAuthUrl(email, secret);
  return qrcode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 260,
    color: { dark: "#ffffff", light: "#0b1a2e" },
  });
}

export function verifyTotp(secret: string, token: string): boolean {
  const cleaned = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  try {
    const result = verifySync({
      secret,
      token: cleaned,
      epochTolerance: EPOCH_TOLERANCE_SEC,
    });
    return result.valid;
  } catch {
    return false;
  }
}

export function encryptTotpSecret(secret: string): string {
  return encryptSecret(secret);
}

export function decryptTotpSecret(encrypted: string): string {
  return decryptSecret(encrypted);
}

// ── Recovery codes ───────────────────────────────────────────────────

const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/O/1/l/i

function generateOneRecoveryCode(): string {
  const bytes = randomBytes(10);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += RECOVERY_ALPHABET[bytes[i] % RECOVERY_ALPHABET.length];
  }
  return `${s.slice(0, 5)}-${s.slice(5, 10)}`;
}

export async function generateAndStoreRecoveryCodes(
  userId: number,
): Promise<string[]> {
  await db
    .delete(schema.userRecoveryCodes)
    .where(eq(schema.userRecoveryCodes.userId, userId));

  const plaintexts: string[] = [];
  const rows: Array<{
    userId: number;
    codeHash: string;
    createdAt: Date;
  }> = [];
  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const code = generateOneRecoveryCode();
    plaintexts.push(code);
    rows.push({
      userId,
      codeHash: await bcrypt.hash(code, 10),
      createdAt: new Date(),
    });
  }
  await db.insert(schema.userRecoveryCodes).values(rows);
  return plaintexts;
}

export async function consumeRecoveryCode(
  userId: number,
  submitted: string,
): Promise<boolean> {
  const cleaned = submitted.trim().toLowerCase();
  if (!/^[a-z0-9]{5}-[a-z0-9]{5}$/.test(cleaned)) return false;

  const rows = await db
    .select()
    .from(schema.userRecoveryCodes)
    .where(
      and(
        eq(schema.userRecoveryCodes.userId, userId),
        isNull(schema.userRecoveryCodes.usedAt),
      ),
    );

  for (const row of rows) {
    if (await bcrypt.compare(cleaned, row.codeHash)) {
      await db
        .update(schema.userRecoveryCodes)
        .set({ usedAt: new Date() })
        .where(eq(schema.userRecoveryCodes.id, row.id));
      return true;
    }
  }
  return false;
}

export async function remainingRecoveryCodeCount(
  userId: number,
): Promise<number> {
  const rows = await db
    .select({ id: schema.userRecoveryCodes.id })
    .from(schema.userRecoveryCodes)
    .where(
      and(
        eq(schema.userRecoveryCodes.userId, userId),
        isNull(schema.userRecoveryCodes.usedAt),
      ),
    );
  return rows.length;
}

export async function clearTotpAndRecoveryCodes(userId: number) {
  await db
    .update(schema.users)
    .set({
      totpSecret: null,
      totpEnrolledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));
  await db
    .delete(schema.userRecoveryCodes)
    .where(eq(schema.userRecoveryCodes.userId, userId));
}

export async function setUserTotp(
  userId: number,
  encryptedSecret: string,
): Promise<void> {
  await db
    .update(schema.users)
    .set({
      totpSecret: encryptedSecret,
      totpEnrolledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));
}
