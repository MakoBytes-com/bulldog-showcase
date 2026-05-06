/**
 * Seed the first admin user for the Bulldog admin panel.
 *
 * Usage:
 *   npm run db:seed-admin -- --email admin@bulldogsecurityservice.com --name "Mako Admin"
 *   npm run db:seed-admin -- --email <email> --name "<name>" --password <plaintext>
 *
 * If --password is omitted, generates a 16-char temp password and prints it.
 * The user must change it on first login (handled in the panel UI).
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import * as schema from "../lib/db/schema";

function arg(flag: string): string | null {
  const i = process.argv.indexOf(flag);
  if (i < 0 || i + 1 >= process.argv.length) return null;
  return process.argv[i + 1];
}

function randomPassword(): string {
  const alphabet =
    "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += alphabet[bytes[i] % alphabet.length];
  }
  return s;
}

async function main() {
  const email = arg("--email")?.toLowerCase();
  const name = arg("--name");
  const passwordIn = arg("--password");

  if (!email || !name) {
    console.error(
      "Usage: npm run db:seed-admin -- --email <email> --name \"<name>\" [--password <plaintext>]",
    );
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Invalid email format.");
    process.exit(1);
  }

  const url = process.env.DATABASE_URI;
  if (!url) {
    console.error("DATABASE_URI env var is not set (check .env.local).");
    process.exit(1);
  }

  const password = passwordIn ?? randomPassword();
  const generated = !passwordIn;

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.error(`User ${email} already exists (id=${existing[0].id}).`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const now = new Date();
  const [row] = await db
    .insert(schema.users)
    .values({
      email,
      name,
      role: "admin",
      passwordHash: hash,
      updatedAt: now,
      createdAt: now,
    })
    .returning();

  console.log(`✓ Created admin user id=${row.id} email=${row.email}`);
  if (generated) {
    console.log("");
    console.log("  Temporary password:");
    console.log(`  ${password}`);
    console.log("");
    console.log("  Sign in at /admin/login then change it on /admin/profile.");
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
