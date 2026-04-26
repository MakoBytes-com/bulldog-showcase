/**
 * AES-256-GCM encryption for small secrets at rest (TOTP keys).
 *
 * The encryption key is derived from SESSION_SECRET via HKDF-SHA-256
 * with a fixed info tag. Rotating SESSION_SECRET therefore invalidates
 * every encrypted secret in the DB — which also logs everyone out,
 * which is the correct blast radius.
 *
 * Output format (base64url): `v1.<iv:12>.<ciphertext+tag>`.
 */

import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "node:crypto";

const VERSION = "v1";
const IV_BYTES = 12;
const KEY_BYTES = 32;
const HKDF_SALT = Buffer.from("mako-secret-crypto-salt/v1");
const HKDF_INFO = Buffer.from("totp-secret/v1");

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function unb64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set");
  }
  const derived = hkdfSync(
    "sha256",
    Buffer.from(secret, "utf8"),
    HKDF_SALT,
    HKDF_INFO,
    KEY_BYTES,
  );
  return Buffer.from(derived);
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ct = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${VERSION}.${b64url(iv)}.${b64url(Buffer.concat([ct, tag]))}`;
}

export function decryptSecret(token: string): string {
  const [ver, ivPart, bodyPart] = token.split(".");
  if (ver !== VERSION || !ivPart || !bodyPart) {
    throw new Error("Invalid secret token format");
  }
  const iv = unb64url(ivPart);
  const body = unb64url(bodyPart);
  if (body.length < 16) throw new Error("Invalid secret token body");
  const tag = body.subarray(body.length - 16);
  const ct = body.subarray(0, body.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}
