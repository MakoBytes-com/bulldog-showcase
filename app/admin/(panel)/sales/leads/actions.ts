"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";

export type ActionResult = { ok: true } | { ok: false; error: string };

const VALID_STATUSES = [
  "new",
  "saved",
  "mailed",
  "contacted",
  "quoted",
  "won",
  "dead",
] as const;
type Status = (typeof VALID_STATUSES)[number];

function asStatus(raw: unknown): Status | null {
  if (typeof raw !== "string") return null;
  return (VALID_STATUSES as readonly string[]).includes(raw)
    ? (raw as Status)
    : null;
}

export async function updateLeadAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminUserId();

  const id = Number(formData.get("id"));
  if (!id || !Number.isFinite(id)) {
    return { ok: false, error: "Invalid lead id." };
  }

  const status = asStatus(formData.get("status"));
  if (!status) return { ok: false, error: "Invalid status." };

  const notesRaw = formData.get("notes");
  const notes = typeof notesRaw === "string" ? notesRaw.trim() : null;

  const nextActionRaw = formData.get("next_action_at");
  let nextActionAt: Date | null = null;
  if (typeof nextActionRaw === "string" && nextActionRaw.length > 0) {
    const d = new Date(nextActionRaw);
    if (!Number.isNaN(d.getTime())) nextActionAt = d;
  }

  const dncFlag = formData.get("internal_do_not_contact") === "on";

  await db
    .update(schema.salesLeads)
    .set({
      status,
      notes: notes && notes.length > 0 ? notes : null,
      nextActionAt,
      internalDoNotContact: dncFlag,
      updatedAt: new Date(),
    })
    .where(eq(schema.salesLeads.id, id));

  revalidatePath(`/admin/sales/leads/${id}`);
  revalidatePath("/admin/sales/home-sales");
  revalidatePath("/admin/sales/businesses");
  revalidatePath("/admin/sales/saved");
  revalidatePath("/admin/sales");

  return { ok: true };
}
