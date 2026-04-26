/**
 * User queries for Makopanel auth. Thin wrappers around Drizzle.
 */

import { eq, isNull, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { hashPassword } from "./passwords";
import type { Role } from "./session";

export async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserById(id: number) {
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listUsers() {
  return db
    .select()
    .from(schema.users)
    .orderBy(schema.users.createdAt);
}

export async function createUser(input: {
  email: string;
  name: string;
  role: Role;
  password: string;
}) {
  const hash = await hashPassword(input.password);
  const [row] = await db
    .insert(schema.users)
    .values({
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      passwordHash: hash,
      updatedAt: new Date(),
      createdAt: new Date(),
    })
    .returning();
  return row;
}

export async function updateUser(
  id: number,
  input: Partial<{
    email: string;
    name: string;
    role: Role;
    password: string;
  }>,
) {
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (input.email) values.email = input.email.toLowerCase();
  if (input.name) values.name = input.name;
  if (input.role) values.role = input.role;
  if (input.password) values.passwordHash = await hashPassword(input.password);

  const [row] = await db
    .update(schema.users)
    .set(values)
    .where(eq(schema.users.id, id))
    .returning();
  return row;
}

export async function setUserDisabled(id: number, disabled: boolean) {
  const [row] = await db
    .update(schema.users)
    .set({
      disabledAt: disabled ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, id))
    .returning();
  return row;
}

export async function recordLogin(id: number) {
  await db
    .update(schema.users)
    .set({ lastLoginAt: new Date() })
    .where(eq(schema.users.id, id));
}

export async function countActiveAdmins(): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.users)
    .where(
      sql`${schema.users.role} = 'admin' AND ${schema.users.disabledAt} IS NULL`,
    );
  return rows[0]?.n ?? 0;
}
