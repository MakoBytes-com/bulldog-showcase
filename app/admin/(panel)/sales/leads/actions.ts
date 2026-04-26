"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";
import { logLeadEvent } from "@/lib/db/leadEvents";

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
  const userId = await requireAdminUserId();

  const id = Number(formData.get("id"));
  if (!id || !Number.isFinite(id)) {
    return { ok: false, error: "Invalid lead id." };
  }

  const status = asStatus(formData.get("status"));
  if (!status) return { ok: false, error: "Invalid status." };

  const notesRaw = formData.get("notes");
  const notes = typeof notesRaw === "string" ? notesRaw.trim() : null;
  const notesNormalized = notes && notes.length > 0 ? notes : null;

  const nextActionRaw = formData.get("next_action_at");
  let nextActionAt: Date | null = null;
  if (typeof nextActionRaw === "string" && nextActionRaw.length > 0) {
    const d = new Date(nextActionRaw);
    if (!Number.isNaN(d.getTime())) nextActionAt = d;
  }

  const dncFlag = formData.get("internal_do_not_contact") === "on";

  // Read the lead BEFORE the update so we can diff it and log
  // semantically meaningful events (status_change, note_changed, etc.)
  // rather than a single opaque "edited" event.
  const before = await db
    .select()
    .from(schema.salesLeads)
    .where(eq(schema.salesLeads.id, id))
    .limit(1);
  const prev = before[0];
  if (!prev) return { ok: false, error: "Lead not found." };

  await db
    .update(schema.salesLeads)
    .set({
      status,
      notes: notesNormalized,
      nextActionAt,
      internalDoNotContact: dncFlag,
      updatedAt: new Date(),
    })
    .where(eq(schema.salesLeads.id, id));

  // Log each meaningful change. Done after the write so audit-log
  // failures can't leave the row half-updated.
  if (prev.status !== status) {
    await logLeadEvent({
      leadId: id,
      userId,
      kind: "status_change",
      detail: { from: prev.status, to: status },
    });
  }
  if ((prev.notes ?? null) !== notesNormalized) {
    await logLeadEvent({
      leadId: id,
      userId,
      kind: "note_changed",
      detail: {
        cleared: notesNormalized === null,
        length: notesNormalized?.length ?? 0,
      },
    });
  }
  const prevNextActionMs = prev.nextActionAt
    ? new Date(prev.nextActionAt).getTime()
    : null;
  const newNextActionMs = nextActionAt ? nextActionAt.getTime() : null;
  if (prevNextActionMs !== newNextActionMs) {
    await logLeadEvent({
      leadId: id,
      userId,
      kind: newNextActionMs === null ? "next_action_cleared" : "next_action_set",
      detail: newNextActionMs ? { at: nextActionAt!.toISOString() } : undefined,
    });
  }
  if (prev.internalDoNotContact !== dncFlag) {
    await logLeadEvent({
      leadId: id,
      userId,
      kind: dncFlag ? "dnc_set" : "dnc_cleared",
    });
  }

  revalidatePath(`/admin/sales/leads/${id}`);
  revalidatePath("/admin/sales/home-sales");
  revalidatePath("/admin/sales/businesses");
  revalidatePath("/admin/sales/saved");
  revalidatePath("/admin/sales");

  return { ok: true };
}
