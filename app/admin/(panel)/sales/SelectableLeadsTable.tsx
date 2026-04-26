"use client";

import { useMemo, useState, useTransition } from "react";

import type { SalesLead } from "@/lib/db/schema";

import { Card } from "../../_components/ui";
import { exportSelectedAction } from "./actions";

type LeadSource = "home-sale" | "business-filing";

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

function filingDate(lead: SalesLead, source: LeadSource): string | null {
  const meta = (lead.metadata ?? {}) as Record<string, unknown>;
  if (source === "home-sale") {
    const v = meta.fileDate;
    return typeof v === "string" ? v : null;
  }
  const v = meta.permitIssueDate;
  return typeof v === "string" ? v : null;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SelectableLeadsTable({
  leads,
  source,
  page,
  totalPages,
  totalDistinct,
  basePath,
  emptyTitle,
  emptyBody,
}: {
  leads: SalesLead[];
  source: LeadSource;
  page: number;
  totalPages: number;
  totalDistinct: number;
  basePath: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const allIds = useMemo(() => leads.map((l) => l.id), [leads]);
  const allSelected = selected.size > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;
  const isHome = source === "home-sale";
  const nameLabel = isHome ? "Buyer" : "Business";
  const dateLabel = isHome ? "Sale" : "Formed";

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  }

  function handleExport() {
    if (selected.size === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await exportSelectedAction([...selected], source);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      downloadCsv(result.filename, result.csv);
      setLastExport(`Exported ${result.count} lead${result.count === 1 ? "" : "s"} → marked as Mailed`);
      setSelected(new Set());
    });
  }

  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-base font-semibold text-white">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-[#cfd9e5]">{emptyBody}</p>
      </Card>
    );
  }

  const start = (page - 1) * 100 + 1;
  const end = start + leads.length - 1;
  const noun = isHome ? "lead" : "business";

  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-[#1d3554] bg-[#0b1a2e] px-5 py-3 text-xs text-[#cfd9e5]">
        Tip: click anywhere on a row to select it. The CSV is the
        universal format every print-and-mail house accepts (Click2Mail,
        MailMyStatements, Lob, your local printer) and is{" "}
        <strong className="text-white">Salesforce-import-ready</strong>{" "}
        &mdash; the columns map directly to Lead fields (name, street,
        city, state, postal code) via Data Loader or Setup &rarr; Data
        Import Wizard. Once exported, leads are marked as
        &ldquo;mailed&rdquo; and move into{" "}
        <a
          href="/admin/sales/saved"
          className="text-[#4fa8e0] underline-offset-4 hover:underline"
        >
          Saved Leads
        </a>
        .
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1d3554] bg-[#0e2b5c] px-5 py-3">
        <div className="text-sm text-[#cfd9e5]">
          {selected.size === 0 ? (
            <span>
              Showing {start}&ndash;{end} of {totalDistinct.toLocaleString()}{" "}
              {noun}
              {totalDistinct === 1 ? "" : "s"}. Select rows to export.
            </span>
          ) : (
            <span className="font-medium text-white">{selected.size} selected</span>
          )}
          {lastExport ? (
            <span className="ml-3 text-xs text-emerald-300">{lastExport}</span>
          ) : null}
          {error ? (
            <span className="ml-3 text-xs text-rose-300">{error}</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={selected.size === 0 || isPending}
          className="rounded-lg bg-[#006fb9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a94d6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending
            ? "Exporting…"
            : selected.size === 0
              ? "Export Selected → CSV"
              : `Export ${selected.size} → CSV & Mark Mailed`}
        </button>
      </div>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
            <tr>
              <th className="px-3 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all leads"
                  className="h-4 w-4 cursor-pointer accent-[#3a94d6]"
                />
              </th>
              <th className="px-5 py-3 font-medium">{nameLabel}</th>
              <th className="px-5 py-3 font-medium">Address</th>
              <th className="px-5 py-3 font-medium">{dateLabel}</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1d3554]">
            {leads.map((lead) => {
              const isSelected = selected.has(lead.id);
              const fdate = filingDate(lead, source);
              return (
                <tr
                  key={lead.id}
                  className={`cursor-pointer text-[#cfd9e5] transition ${
                    isSelected ? "bg-[#0e2b5c]/60" : "hover:bg-[#0e2b5c]/40"
                  }`}
                  onClick={() => toggle(lead.id)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(lead.id)}
                      aria-label={`Select ${lead.name}`}
                      className="h-4 w-4 cursor-pointer accent-[#3a94d6]"
                    />
                  </td>
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
                  <td className="px-5 py-3 text-xs text-[#cfd9e5]">
                    {fdate ?? <span className="text-[#7a8aa0]">—</span>}
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
                      <span className="text-[#7a8aa0]">Mail-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1d3554] bg-[#0e2b5c]/40 px-5 py-2.5 text-sm">
          <span className="text-[#cfd9e5]">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <a
                href={`${basePath}?page=${page - 1}`}
                className="rounded-md border border-[#1d3554] bg-[#0b1a2e] px-3 py-1.5 text-xs font-medium text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white"
              >
                ← Prev
              </a>
            ) : (
              <span className="rounded-md border border-[#1d3554]/40 bg-[#0b1a2e]/40 px-3 py-1.5 text-xs text-[#7a8aa0]">
                ← Prev
              </span>
            )}
            {page < totalPages ? (
              <a
                href={`${basePath}?page=${page + 1}`}
                className="rounded-md border border-[#1d3554] bg-[#0b1a2e] px-3 py-1.5 text-xs font-medium text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white"
              >
                Next →
              </a>
            ) : (
              <span className="rounded-md border border-[#1d3554]/40 bg-[#0b1a2e]/40 px-3 py-1.5 text-xs text-[#7a8aa0]">
                Next →
              </span>
            )}
          </div>
        </div>
      ) : null}

    </div>
  );
}
