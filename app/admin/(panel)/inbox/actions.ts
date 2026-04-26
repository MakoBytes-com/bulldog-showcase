"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteSubmission,
  setSubmissionHandled,
  setSubmissionNotes,
} from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";

async function requireAuthed(): Promise<void> {
  const session = await getSession();
  if (!session.userId) throw new Error("unauthorized");
}

export async function toggleHandledAction(formData: FormData) {
  await requireAuthed();
  const id = Number(formData.get("id"));
  const handled = formData.get("handled") === "true";
  if (!id) return;
  await setSubmissionHandled(id, handled);
  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${id}`);
}

export async function saveNotesAction(formData: FormData) {
  await requireAuthed();
  const id = Number(formData.get("id"));
  const notes = String(formData.get("notes") ?? "");
  if (!id) return;
  await setSubmissionNotes(id, notes);
  revalidatePath(`/admin/inbox/${id}`);
}

export async function deleteSubmissionAction(formData: FormData) {
  await requireAuthed();
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteSubmission(id);
  revalidatePath("/admin/inbox");
  redirect("/admin/inbox");
}
