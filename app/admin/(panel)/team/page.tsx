import Link from "next/link";

import { listTeam } from "@/lib/db/queries";
import {
  Card,
  EmptyState,
  PageHeader,
  PrimaryLink,
} from "../../_components/ui";

export const metadata = { title: "Team" };

export default async function TeamListPage() {
  const rows = await listTeam();

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle={`${rows.length} ${rows.length === 1 ? "member" : "members"}`}
        actions={
          <PrimaryLink href="/admin/team/new">+ New team member</PrimaryLink>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No team members"
          description="Add your first team member."
          action={<PrimaryLink href="/admin/team/new">+ New team member</PrimaryLink>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Contact</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[#1d3554]/60 last:border-0 hover:bg-[#152e4a]"
                >
                  <td className="px-5 py-4 text-[#cfd9e5]">{m.order ?? "—"}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/team/${m.id}`}
                      className="font-medium text-white"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[#cfd9e5]">{m.role}</td>
                  <td className="px-5 py-4 text-[#cfd9e5]">
                    {m.email ? (
                      <a
                        className="text-[#3a94d6] hover:text-white"
                        href={`mailto:${m.email}`}
                      >
                        {m.email}
                      </a>
                    ) : (
                      "—"
                    )}
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
