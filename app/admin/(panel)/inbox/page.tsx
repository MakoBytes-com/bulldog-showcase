import Link from "next/link";

import { listSubmissions } from "@/lib/db/queries";
import {
  Card,
  EmptyState,
  PageHeader,
  Pill,
} from "../../_components/ui";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  const rows = await listSubmissions();
  const unhandled = rows.filter((r) => !r.handled).length;

  return (
    <div>
      <PageHeader
        title="Inbox"
        subtitle={
          rows.length === 0
            ? "No contact form submissions yet."
            : `${unhandled} unread · ${rows.length} total`
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Empty inbox"
          description="When someone fills out the /contact form, it shows up here."
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="px-5 py-3 font-medium">Received</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Service need</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#1d3554]/60 last:border-0 hover:bg-[#152e4a]"
                >
                  <td className="px-5 py-4 text-[#cfd9e5]">
                    <Link
                      href={`/admin/inbox/${r.id}`}
                      className="block w-full"
                    >
                      {new Date(r.createdAt).toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-white">
                    <Link
                      href={`/admin/inbox/${r.id}`}
                      className="block w-full font-medium"
                    >
                      {r.name}
                    </Link>
                    <div className="text-xs text-[#7a8aa0]">{r.email}</div>
                  </td>
                  <td className="px-5 py-4 text-[#cfd9e5]">
                    {r.company || "—"}
                  </td>
                  <td className="px-5 py-4 text-[#cfd9e5]">
                    {r.serviceNeed || "—"}
                  </td>
                  <td className="px-5 py-4">
                    {r.handled ? (
                      <Pill tone="success">Handled</Pill>
                    ) : (
                      <Pill tone="info">New</Pill>
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
