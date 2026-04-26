"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import {
  countActiveAdmins,
  createUser,
  findUserById,
  setUserDisabled,
  updateUser,
} from "@/lib/auth/users";
import { clearTotpAndRecoveryCodes } from "@/lib/auth/totp";

async function requireAdmin() {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    throw new Error("Admins only.");
  }
  return session;
}

function validateRole(raw: unknown): "admin" | "editor" {
  return raw === "admin" ? "admin" : "editor";
}

export async function createUserAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = validateRole(formData.get("role"));
  const password = String(formData.get("password") ?? "");

  if (!email || !name || password.length < 10) {
    return {
      error: "Email, name, and a password of at least 10 characters are required.",
    };
  }

  try {
    await createUser({ email, name, role, password });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { error: "A user with that email already exists." };
    }
    return { error: "Could not create user." };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUserAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!id) return { error: "Missing user id." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = validateRole(formData.get("role"));
  const password = String(formData.get("password") ?? "");

  if (!email || !name) {
    return { error: "Email and name are required." };
  }
  if (password && password.length < 10) {
    return { error: "New password must be at least 10 characters." };
  }

  // Refuse to demote/disable the last active admin.
  if (role !== "admin") {
    const target = await findUserById(id);
    if (target?.role === "admin" && !target.disabledAt) {
      const activeAdmins = await countActiveAdmins();
      if (activeAdmins <= 1) {
        return {
          error: "Cannot demote the last active admin. Promote another user first.",
        };
      }
    }
  }

  try {
    await updateUser(id, {
      email,
      name,
      role,
      password: password || undefined,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return { error: "A user with that email already exists." };
    }
    return { error: "Could not update user." };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleDisabledAction(formData: FormData) {
  const session = await requireAdmin();

  const id = Number(formData.get("id"));
  const disable = formData.get("disable") === "true";
  if (!id) return;

  if (id === session.userId) {
    // Don't let admins lock themselves out.
    throw new Error("You cannot disable your own account.");
  }

  // Last-admin protection on disable.
  if (disable) {
    const target = await findUserById(id);
    if (target?.role === "admin" && !target.disabledAt) {
      const activeAdmins = await countActiveAdmins();
      if (activeAdmins <= 1) {
        throw new Error("Cannot disable the last active admin.");
      }
    }
  }

  await setUserDisabled(id, disable);
  revalidatePath("/admin/users");
}

export async function resetUserTotpAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const target = await findUserById(id);
  if (!target) return;
  await clearTotpAndRecoveryCodes(id);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}
