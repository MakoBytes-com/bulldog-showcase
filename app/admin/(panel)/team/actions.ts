"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

async function requireAuthedUserId(): Promise<number> {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("unauthorized");
  }
  return session.userId;
}

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    linkedIn: String(formData.get("linked_in") ?? "").trim() || null,
    order: String(formData.get("order") ?? "").trim() || null,
  };
}

export async function createTeamMemberAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAuthedUserId();
  const f = parse(formData);
  if (!f.name || !f.role) return { error: "Name and role are required." };
  await db.insert(schema.teamMembers).values({
    name: f.name,
    role: f.role,
    bio: f.bio,
    email: f.email,
    linkedIn: f.linkedIn,
    order: f.order ?? undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath("/admin/team");
  revalidatePath("/about");
  redirect("/admin/team");
}

export async function updateTeamMemberAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAuthedUserId();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Missing id." };
  const f = parse(formData);
  if (!f.name || !f.role) return { error: "Name and role are required." };
  await db
    .update(schema.teamMembers)
    .set({
      name: f.name,
      role: f.role,
      bio: f.bio,
      email: f.email,
      linkedIn: f.linkedIn,
      order: f.order ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.teamMembers.id, id));
  revalidatePath("/admin/team");
  revalidatePath("/about");
  redirect("/admin/team");
}

export async function deleteTeamMemberAction(formData: FormData) {
  await requireAuthedUserId();
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id));
  revalidatePath("/admin/team");
  revalidatePath("/about");
  redirect("/admin/team");
}
