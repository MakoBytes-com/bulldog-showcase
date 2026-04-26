"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { estimateReadingMinutes } from "@/lib/content/markdown";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";

const CATEGORIES = [
  "Home Security",
  "Business Security",
  "Smart Home",
  "Industry News",
  "Tips & Guides",
] as const;
type Category = (typeof CATEGORIES)[number];

function validateCategory(raw: unknown): Category | null {
  if (typeof raw !== "string") return null;
  return (CATEGORIES as readonly string[]).includes(raw)
    ? (raw as Category)
    : null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function parseFormFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw ? slugify(slugRaw) : slugify(title);
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const category = validateCategory(formData.get("category"));
  const contentMd = String(formData.get("content_md") ?? "");
  const status: "draft" | "published" =
    formData.get("status") === "published" ? "published" : "draft";
  const publishedAtRaw = String(formData.get("published_at") ?? "").trim();
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : null;
  return {
    title,
    slug,
    excerpt,
    category,
    contentMd,
    status,
    publishedAt,
    readingMinutes: estimateReadingMinutes(contentMd),
  };
}

export async function createPostAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdminUserId();
  const f = parseFormFields(formData);
  if (!f.title) return { error: "Title is required." };
  if (!f.slug) return { error: "Slug could not be generated from title." };

  try {
    const [row] = await db
      .insert(schema.posts)
      .values({
        title: f.title,
        slug: f.slug,
        excerpt: f.excerpt,
        category: f.category,
        contentMd: f.contentMd,
        readingMinutes: String(f.readingMinutes),
        status: f.status,
        publishedAt:
          f.status === "published"
            ? (f.publishedAt ?? new Date())
            : f.publishedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: schema.posts.id });
    revalidatePath("/admin/posts");
    redirect(`/admin/posts/${row.id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { error: "A post with that slug already exists." };
    }
    // Next.js redirects throw — re-throw them.
    if (msg === "NEXT_REDIRECT") throw err;
    return { error: "Could not create post." };
  }
  return { error: null };
}

export async function updatePostAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdminUserId();
  const id = Number(formData.get("id"));
  if (!id) return { error: "Missing post id." };

  const f = parseFormFields(formData);
  if (!f.title) return { error: "Title is required." };
  if (!f.slug) return { error: "Slug could not be generated." };

  try {
    await db
      .update(schema.posts)
      .set({
        title: f.title,
        slug: f.slug,
        excerpt: f.excerpt,
        category: f.category,
        contentMd: f.contentMd,
        readingMinutes: String(f.readingMinutes),
        status: f.status,
        publishedAt:
          f.status === "published"
            ? (f.publishedAt ?? new Date())
            : f.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.posts.id, id));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { error: "A post with that slug already exists." };
    }
    return { error: "Could not update post." };
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
  revalidatePath("/blog");
  return { error: null };
}

export async function deletePostAction(formData: FormData) {
  await requireAdminUserId();
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.delete(schema.posts).where(eq(schema.posts.id, id));
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}
