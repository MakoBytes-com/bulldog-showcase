"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";

const CATEGORIES = [
  "general",
  "monitoring",
  "cameras",
  "smart-home",
  "commercial",
] as const;

function validCategory(raw: unknown) {
  return typeof raw === "string" &&
    (CATEGORIES as readonly string[]).includes(raw)
    ? (raw as (typeof CATEGORIES)[number])
    : null;
}

function parse(formData: FormData) {
  return {
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    category: validCategory(formData.get("category")),
    order: String(formData.get("order") ?? "").trim() || null,
  };
}

export async function createFaqAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdminUserId();
  const f = parse(formData);
  if (!f.question || !f.answer)
    return { error: "Question and answer are required." };
  await db.insert(schema.faqs).values({
    question: f.question,
    answer: f.answer,
    category: f.category,
    order: f.order ?? undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  redirect("/admin/faqs");
}

export async function updateFaqAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdminUserId();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Missing id." };
  const f = parse(formData);
  if (!f.question || !f.answer)
    return { error: "Question and answer are required." };
  await db
    .update(schema.faqs)
    .set({
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: f.order ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(schema.faqs.id, id));
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  redirect("/admin/faqs");
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdminUserId();
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.delete(schema.faqs).where(eq(schema.faqs.id, id));
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  redirect("/admin/faqs");
}
