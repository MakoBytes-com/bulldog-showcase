import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";
import {
  Card,
  EmptyState,
  PageHeader,
  Pill,
  PrimaryLink,
  SecondaryLink,
} from "../../_components/ui";
import { ToggleDisabledButton } from "./ToggleDisabledButton";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const session = await getSession();
  if (session.role !== "admin") redirect("/admin");

  const users = await listUsers();

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Admins can manage content and other users. Editors can manage content only."
        actions={<PrimaryLink href="/admin/users/new">+ New user</PrimaryLink>}
      />

      {users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Create your first admin user."
          action={<PrimaryLink href="/admin/users/new">+ New user</PrimaryLink>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last login</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[#1d3554]/60 last:border-0"
                >
                  <td className="px-5 py-4 text-white">{u.name}</td>
                  <td className="px-5 py-4 text-[#cfd9e5]">{u.email}</td>
                  <td className="px-5 py-4">
                    <Pill tone={u.role === "admin" ? "info" : "default"}>
                      {u.role}
                    </Pill>
                  </td>
                  <td className="px-5 py-4">
                    {u.disabledAt ? (
                      <Pill tone="danger">Disabled</Pill>
                    ) : (
                      <Pill tone="success">Active</Pill>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#cfd9e5]">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <SecondaryLink href={`/admin/users/${u.id}`}>
                        Edit
                      </SecondaryLink>
                      {u.id !== session.userId ? (
                        <ToggleDisabledButton
                          id={u.id}
                          currentlyDisabled={Boolean(u.disabledAt)}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
