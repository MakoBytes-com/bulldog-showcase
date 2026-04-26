"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";

/**
 * Mark every unresolved error_event with this fingerprint as resolved
 * by the current admin user. Effectively the "all of these are
 * handled" action — Sentry calls it "resolve."
 */
export async function resolveErrorGroupAction(formData: FormData) {
  const userId = await requireAdminUserId();
  const fingerprint = String(formData.get("fingerprint") ?? "").trim();
  if (!fingerprint) return;

  await db
    .update(schema.errorEvents)
    .set({
      resolvedAt: new Date(),
      resolvedBy: userId,
    })
    .where(
      and(
        eq(schema.errorEvents.fingerprint, fingerprint),
        isNull(schema.errorEvents.resolvedAt),
      ),
    );

  revalidatePath("/admin/errors");
  revalidatePath(`/admin/errors/${fingerprint}`);
}

/**
 * Reopen — flip resolved_at back to null for a fingerprint. Useful
 * when an error you marked resolved comes back and you want to
 * track the regression.
 */
export async function reopenErrorGroupAction(formData: FormData) {
  await requireAdminUserId();
  const fingerprint = String(formData.get("fingerprint") ?? "").trim();
  if (!fingerprint) return;

  await db
    .update(schema.errorEvents)
    .set({ resolvedAt: null, resolvedBy: null })
    .where(eq(schema.errorEvents.fingerprint, fingerprint));

  revalidatePath("/admin/errors");
  revalidatePath(`/admin/errors/${fingerprint}`);
}
