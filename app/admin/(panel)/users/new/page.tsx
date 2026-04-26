import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { PageHeader } from "../../../_components/ui";
import { createUserAction } from "../actions";
import { UserForm } from "../UserForm";

export const metadata = { title: "New user" };

export default async function NewUserPage() {
  const session = await getSession();
  if (session.role !== "admin") redirect("/admin");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New user" subtitle="Create an admin account." />
      <UserForm action={createUserAction} mode="create" />
    </div>
  );
}
