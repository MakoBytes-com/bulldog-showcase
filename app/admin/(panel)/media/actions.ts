"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { del, put } from "@vercel/blob";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";
import { checkRateLimit } from "@/lib/auth/rateLimit";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per upload
const ALLOWED_PREFIXES = ["image/", "application/pdf", "video/mp4"];

function slugifyFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "upload";
  return clean + ext.toLowerCase();
}

export async function uploadMediaAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const userId = await requireAdminUserId();

  // Per-user upload rate limit: 30 uploads per hour. Stops accidental
  // runaway loops + caps blast radius if an admin account is compromised.
  const rl = await checkRateLimit({
    key: `media-upload:${userId}`,
    windowMs: 60 * 60 * 1000,
    max: 30,
  });
  if (!rl.allowed) {
    return {
      error: `Upload rate limit reached (30/hour). Try again in ${Math.ceil(rl.resetMs / 60_000)} minutes.`,
    };
  }

  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim() || null;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pick a file to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File is too large (max 25 MB)." };
  }
  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
    return { error: "Only images, MP4, and PDF are allowed." };
  }

  const ts = Date.now();
  const safeName = slugifyFilename(file.name);
  const pathname = `media/${ts}-${safeName}`;

  let url: string;
  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    url = blob.url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Upload failed: ${msg}` };
  }

  let width: number | null = null;
  let height: number | null = null;
  // Cheap width/height extraction for images would need a library
  // (sharp isn't available in Vercel's default runtime). Leave null
  // for now; the admin shows the file without dimensions and the
  // public pages size via Next Image anyway.

  await db.insert(schema.media).values({
    url,
    filename: safeName,
    mimeType: file.type,
    filesize: String(file.size),
    width: width == null ? undefined : String(width),
    height: height == null ? undefined : String(height),
    alt,
    caption,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/admin/media");
  return { error: null };
}

export async function updateMediaMetaAction(formData: FormData) {
  await requireAdminUserId();
  const id = Number(formData.get("id"));
  if (!id) return;
  const alt = String(formData.get("alt") ?? "").trim() || null;
  const caption = String(formData.get("caption") ?? "").trim() || null;
  await db
    .update(schema.media)
    .set({ alt, caption, updatedAt: new Date() })
    .where(eq(schema.media.id, id));
  revalidatePath("/admin/media");
  revalidatePath(`/admin/media/${id}`);
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdminUserId();
  const id = Number(formData.get("id"));
  if (!id) return;

  // Fetch row so we can remove the blob too.
  const rows = await db
    .select()
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);
  const row = rows[0];

  if (row?.url) {
    try {
      await del(row.url);
    } catch {
      // Best-effort; blob may already be gone. Always delete the DB row.
    }
  }

  await db.delete(schema.media).where(eq(schema.media.id, id));
  revalidatePath("/admin/media");
  redirect("/admin/media");
}
