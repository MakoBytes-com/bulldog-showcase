import type { SalesLead } from "@/lib/db/schema";

import { Card } from "../../_components/ui";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-[#3a94d6]/20 text-[#3a94d6]",
  saved: "bg-amber-500/20 text-amber-300",
  mailed: "bg-purple-500/20 text-purple-300",
  contacted: "bg-blue-500/20 text-blue-300",
  quoted: "bg-cyan-500/20 text-cyan-300",
  won: "bg-emerald-500/20 text-emerald-300",
  dead: "bg-zinc-500/20 text-zinc-400",
};

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function LeadsTable({
  leads,
  emptyTitle,
  emptyBody,
}: {
  leads: SalesLead[];
  emptyTitle: string;
  emptyBody: string;
}) {
  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-base font-semibold text-white">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-[#cfd9e5]">{emptyBody}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
          <tr>
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Address</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Compliance</th>
            <th className="px-5 py-3 font-medium">Scraped</th>
            <th className="px-3 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1d3554]">
          {leads.map((lead) => (
            <tr key={lead.id} className="text-[#cfd9e5] hover:bg-[#0e2b5c]/40">
              <td className="px-5 py-3">
                <div className="font-medium text-white">{lead.name}</div>
                {lead.contactPhone || lead.contactEmail ? (
                  <div className="mt-0.5 text-xs text-[#7a8aa0]">
                    {lead.contactPhone ?? ""}
                    {lead.contactPhone && lead.contactEmail ? " · " : ""}
                    {lead.contactEmail ?? ""}
                  </div>
                ) : null}
              </td>
              <td className="px-5 py-3">
                {lead.address ?? "—"}
                {lead.city || lead.state ? (
                  <div className="text-xs text-[#7a8aa0]">
                    {[lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}
                  </div>
                ) : null}
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
                    STATUS_COLORS[lead.status] ?? STATUS_COLORS.new
                  }`}
                >
                  {lead.status}
                </span>
              </td>
              <td className="px-5 py-3 text-xs">
                {lead.internalDoNotContact ? (
                  <span className="text-rose-300">Internal DNC</span>
                ) : lead.dncFlagged ? (
                  <span className="text-amber-300">On DNC list</span>
                ) : lead.consentToCall ? (
                  <span className="text-emerald-300">Consent on file</span>
                ) : lead.dncScrubbedAt ? (
                  <span className="text-[#cfd9e5]">DNC clear · mail-OK</span>
                ) : (
                  <span className="text-[#7a8aa0]">Mail-only (not scrubbed)</span>
                )}
              </td>
              <td className="px-5 py-3 text-xs text-[#7a8aa0]">
                {formatDate(lead.scrapedAt)}
              </td>
              <td className="px-3 py-3 text-right">
                <a
                  href={`/admin/sales/leads/${lead.id}`}
                  className="inline-block whitespace-nowrap rounded-md border border-[#1d3554] bg-[#0b1a2e] px-2.5 py-1 text-xs font-medium text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white"
                >
                  Open&nbsp;→
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
