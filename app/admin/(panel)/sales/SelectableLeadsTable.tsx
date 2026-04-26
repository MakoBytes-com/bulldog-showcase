"use client";

import { useMemo, useState, useTransition } from "react";

import type { SalesLead } from "@/lib/db/schema";
import { scoreLead } from "@/lib/leadScoring";

import { Card } from "../../_components/ui";
import { exportSelectedAction } from "./actions";

type LeadSource = "home-sale" | "business-filing";
type SortKey = "score" | "value" | "date";

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

function hcadInfo(lead: SalesLead): {
  apprVal: number | null;
  matchSource: string | null;
} {
  const meta = (lead.metadata ?? {}) as Record<string, unknown>;
  const hcad = (meta.hcad ?? {}) as Record<string, unknown>;
  const apprVal = typeof hcad.apprVal === "number" ? hcad.apprVal : null;
  const matchSource =
    typeof hcad.matchSource === "string" ? hcad.matchSource : null;
  return { apprVal, matchSource };
}

function formatMoney(n: number | null): string {
  if (n === null) return "—";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function scoreColor(total: number): string {
  // 8-10 = green (hot), 5-7 = amber (warm), 1-4 = grey (cool), 0 = rose (DNC)
  if (total === 0) return "bg-rose-500/15 text-rose-300";
  if (total >= 8) return "bg-emerald-500/15 text-emerald-300";
  if (total >= 5) return "bg-amber-500/15 text-amber-300";
  return "bg-[#1d3554] text-[#7a8aa0]";
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
  coverage,
  minValue = 0,
  sort = "date",
}: {
  leads: SalesLead[];
  source: LeadSource;
  page: number;
  totalPages: number;
  totalDistinct: number;
  basePath: string;
  emptyTitle: string;
  emptyBody: string;
  coverage: { label: string; counties: string[]; note?: string };
  minValue?: number;
  sort?: SortKey;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [filterInput, setFilterInput] = useState<string>(
    minValue > 0 ? String(minValue) : "",
  );

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

  // Build the persisted query-string fragment so pagination + sort
  // links keep the active filter and sort. Always reset page to 1
  // when changing sort so users don't end up on an empty page.
  const filterFrag = minValue > 0 ? `minValue=${minValue}` : "";
  function sortHref(nextSort: SortKey): string {
    const parts: string[] = [];
    if (filterFrag) parts.push(filterFrag);
    if (nextSort !== "score") parts.push(`sort=${nextSort}`);
    return parts.length > 0 ? `${basePath}?${parts.join("&")}` : basePath;
  }
  function SortHeader({
    label,
    keyName,
    align = "left",
  }: {
    label: string;
    keyName: SortKey;
    align?: "left" | "right";
  }) {
    const active = sort === keyName;
    const cls = `cursor-pointer transition hover:text-white ${
      active ? "text-white" : ""
    }`;
    return (
      <a href={sortHref(keyName)} className={cls}>
        {label}
        {active ? <span className="ml-1 text-[#3a94d6]">↓</span> : null}
      </a>
    );
  }

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

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 text-xs text-[#cfd9e5]">
        <span className="mr-2 font-semibold uppercase tracking-widest text-emerald-300">
          Coverage:
        </span>
        <strong className="text-white">{coverage.label}</strong> &mdash;{" "}
        {coverage.counties.join(", ")} {coverage.counties.length === 1 ? "county" : "counties"}.
        {coverage.note ? (
          <span className="ml-1 text-[#7a8aa0]">{coverage.note}</span>
        ) : null}
      </div>

      {isHome ? (
        <form
          method="get"
          action={basePath}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1d3554] bg-[#0b1a2e] px-5 py-3 text-sm"
        >
          {sort !== "score" ? (
            <input type="hidden" name="sort" value={sort} />
          ) : null}
          <label htmlFor="minValue" className="text-[#cfd9e5]">
            Min property value:
          </label>
          <div className="flex items-center gap-1">
            <span className="text-[#7a8aa0]">$</span>
            <input
              id="minValue"
              name="minValue"
              type="number"
              min={0}
              step={50000}
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              placeholder="0 (any)"
              className="w-32 rounded-md border border-[#1d3554] bg-[#0e2b5c] px-3 py-1.5 text-sm text-white placeholder:text-[#7a8aa0] focus:border-[#3a94d6] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-[#3a94d6] bg-[#006fb9] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3a94d6]"
          >
            Apply
          </button>
          {minValue > 0 ? (
            <a
              href={basePath}
              className="text-xs text-[#4fa8e0] underline-offset-4 hover:underline"
            >
              Clear
            </a>
          ) : null}
          <span className="ml-auto text-xs text-[#7a8aa0]">
            Filters by HCAD appraised value. Useful for targeting
            premium-security prospects (e.g. $500K+).
          </span>
        </form>
      ) : null}

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
              {isHome ? (
                <>
                  <th className="px-3 py-3 text-center font-medium">
                    <SortHeader label="Score" keyName="score" />
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    <SortHeader label="Value" keyName="value" align="right" />
                  </th>
                </>
              ) : null}
              <th className="px-5 py-3 font-medium">
                {isHome ? (
                  <SortHeader label={dateLabel} keyName="date" />
                ) : (
                  dateLabel
                )}
              </th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Compliance</th>
              <th className="px-3 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1d3554]">
            {leads.map((lead) => {
              const isSelected = selected.has(lead.id);
              const fdate = filingDate(lead, source);
              const { apprVal, matchSource } = hcadInfo(lead);
              const score = isHome ? scoreLead(lead) : null;
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
                    {isHome && matchSource ? (
                      <div className="mt-1 text-[10px] uppercase tracking-wider">
                        {matchSource === "owner-name" ? (
                          <span className="text-emerald-300/80">
                            ✓ Owner-name match
                          </span>
                        ) : (
                          <span className="text-amber-300/80">
                            ◇ Subdivision+lot match
                          </span>
                        )}
                      </div>
                    ) : null}
                  </td>
                  {isHome && score ? (
                    <>
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          title={score.components
                            .map((c) => `${c.label}: ${c.value} (${c.reason})`)
                            .join("\n")}
                          className={`inline-block min-w-[2rem] cursor-help rounded-md px-2 py-0.5 text-center text-xs font-semibold ${scoreColor(
                            score.total,
                          )}`}
                        >
                          {score.total}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[13px] text-[#cfd9e5]">
                        {formatMoney(apprVal)}
                      </td>
                    </>
                  ) : null}
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
                  <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`/admin/sales/leads/${lead.id}`}
                      className="inline-block whitespace-nowrap rounded-md border border-[#1d3554] bg-[#0b1a2e] px-2.5 py-1 text-xs font-medium text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white"
                    >
                      Open&nbsp;→
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 ? (
        (() => {
          const extras: string[] = [];
          if (minValue > 0) extras.push(`minValue=${minValue}`);
          if (sort !== "score" && isHome) extras.push(`sort=${sort}`);
          const filterQs = extras.length > 0 ? `&${extras.join("&")}` : "";
          return (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1d3554] bg-[#0e2b5c]/40 px-5 py-2.5 text-sm">
              <span className="text-[#cfd9e5]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <a
                    href={`${basePath}?page=${page - 1}${filterQs}`}
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
                    href={`${basePath}?page=${page + 1}${filterQs}`}
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
          );
        })()
      ) : null}

    </div>
  );
}
