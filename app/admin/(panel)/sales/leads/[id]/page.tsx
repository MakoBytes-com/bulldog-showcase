import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { listLeadEvents, type LeadEventWithUser } from "@/lib/db/leadEvents";
import { Card } from "../../../../_components/ui";

import { EditForm } from "./EditForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead detail" };

function formatMoney(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isFinite(leadId)) notFound();

  const rows = await db
    .select()
    .from(schema.salesLeads)
    .where(eq(schema.salesLeads.id, leadId))
    .limit(1);
  const lead = rows[0];
  if (!lead) notFound();

  const events = await listLeadEvents(leadId, 50);

  const meta = (lead.metadata ?? {}) as Record<string, unknown>;
  const hcad = (meta.hcad ?? {}) as Record<string, unknown>;

  const isHome = lead.source === "home-sale";
  const backHref = isHome
    ? "/admin/sales/home-sales"
    : "/admin/sales/businesses";
  const backLabel = isHome ? "← Back to Home Sales" : "← Back to Businesses";

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={backHref}
          className="text-sm text-[#4fa8e0] underline-offset-4 hover:underline"
        >
          {backLabel}
        </Link>
      </div>

      <Card className="p-6">
        <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
          {isHome ? "Home-sale lead" : "Business-filing lead"}
        </div>
        <h2 className="mt-1 text-2xl font-semibold text-white">{lead.name}</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          {lead.address}
          {lead.city || lead.state ? (
            <span className="text-[#7a8aa0]">
              {" — "}
              {[lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}
            </span>
          ) : null}
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-white">Source data</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <DRow
              label="Source"
              value={
                isHome
                  ? "Harris County Clerk — Real Property"
                  : "Texas Comptroller — New Sales Tax Permits"
              }
            />
            <DRow label="External ID" value={lead.externalId} mono />
            {isHome ? (
              <>
                <DRow label="File date" value={String(meta.fileDate ?? "—")} />
                <DRow label="Type" value={String(meta.type ?? "—")} />
                <DRow
                  label="Subdivision"
                  value={String(meta.description ?? "—")}
                />
                <DRow label="Section" value={String(meta.section ?? "—")} />
                <DRow label="Lot" value={String(meta.lot ?? "—")} />
                <DRow label="Block" value={String(meta.block ?? "—")} />
              </>
            ) : (
              <>
                <DRow
                  label="Permit issued"
                  value={String(meta.permitIssueDate ?? "—")}
                />
                <DRow
                  label="First sales date"
                  value={String(meta.firstSalesDate ?? "—")}
                />
                <DRow
                  label="Taxpayer name"
                  value={String(meta.taxpayerName ?? "—")}
                />
                <DRow
                  label="Taxpayer #"
                  value={String(meta.taxpayerNumber ?? "—")}
                  mono
                />
              </>
            )}
            <DRow label="Scraped" value={formatDate(lead.scrapedAt)} />
          </dl>
        </Card>

        {isHome && Object.keys(hcad).length > 0 ? (
          <Card className="p-6">
            <h3 className="text-base font-semibold text-white">
              HCAD parcel data
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <DRow label="HCAD #" value={String(hcad.hcadNum ?? "—")} mono />
              <DRow
                label="Current owner"
                value={String(hcad.currentOwner ?? "—")}
              />
              <DRow
                label="Subdivision (HCAD)"
                value={String(hcad.subdivision ?? "—")}
              />
              <DRow
                label="Appraised value"
                value={formatMoney((hcad.apprVal as number) ?? null)}
              />
              <DRow
                label="Market value"
                value={formatMoney((hcad.mktVal as number) ?? null)}
              />
              <DRow
                label="Match confidence"
                value={
                  hcad.matchSource === "owner-name"
                    ? "✓ Owner-name match (high)"
                    : hcad.matchSource === "legal-description"
                      ? "◇ Subdivision+Lot/Block match (medium)"
                      : "—"
                }
              />
              <DRow
                label="Enriched"
                value={String(hcad.enrichedAt ?? "—").slice(0, 19)}
              />
            </dl>
          </Card>
        ) : null}
      </div>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Pipeline workflow
        </h3>
        <p className="mt-1 text-sm text-[#cfd9e5]">
          Update the status as this lead progresses. Status changes flow
          through to CSV exports as Salesforce-compatible Lead Status values.
        </p>
        <div className="mt-5">
          <EditForm lead={lead} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">Activity</h3>
        <p className="mt-1 text-sm text-[#cfd9e5]">
          Every status change, note edit, export, and DNC toggle is
          recorded here with the user who made it. Most recent first.
        </p>
        <div className="mt-5">
          <ActivityTimeline events={events} />
        </div>
      </Card>
    </div>
  );
}

function ActivityTimeline({ events }: { events: LeadEventWithUser[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[#7a8aa0]">
        No activity yet — changes you make below will start appearing here.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {events.map((e) => {
        const desc = describeEvent(e);
        const who = e.userName ?? (e.userId === null ? "System" : "User");
        const when = formatActivityTime(e.createdAt);
        return (
          <li
            key={e.id}
            className="flex items-start gap-3 border-l-2 border-[#1d3554] pl-4"
          >
            <div className="-ml-[1.4rem] mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#3a94d6]" />
            <div className="flex-1">
              <div className="text-sm text-[#cfd9e5]">{desc}</div>
              <div className="mt-0.5 text-xs text-[#7a8aa0]">
                <span className="font-medium text-[#cfd9e5]">{who}</span>
                {" · "}
                {when}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function describeEvent(e: LeadEventWithUser): ReactNode {
  const detail = e.detail ?? {};
  switch (e.kind) {
    case "status_change":
      return (
        <>
          Status changed{" "}
          <span className="font-mono text-[12px] text-[#7a8aa0]">
            {String(detail.from ?? "?")}
          </span>{" "}
          →{" "}
          <span className="font-mono text-[12px] text-emerald-300">
            {String(detail.to ?? "?")}
          </span>
        </>
      );
    case "bulk_status_change":
      return (
        <>
          Status changed (bulk action,{" "}
          {String(detail.batchSize ?? "?")} leads){" "}
          <span className="font-mono text-[12px] text-[#7a8aa0]">
            {String(detail.from ?? "?")}
          </span>{" "}
          →{" "}
          <span className="font-mono text-[12px] text-emerald-300">
            {String(detail.to ?? "?")}
          </span>
        </>
      );
    case "note_changed":
      if (detail.cleared) return "Notes cleared";
      return (
        <>
          Notes edited{" "}
          <span className="text-[#7a8aa0]">
            ({String(detail.length ?? 0)} chars)
          </span>
        </>
      );
    case "next_action_set":
      return (
        <>
          Next action set for{" "}
          <span className="font-mono text-[12px] text-[#cfd9e5]">
            {typeof detail.at === "string"
              ? new Date(detail.at).toLocaleString()
              : "—"}
          </span>
        </>
      );
    case "next_action_cleared":
      return "Next action cleared";
    case "dnc_set":
      return (
        <span className="text-rose-300">
          Internal Do-Not-Contact flag set
        </span>
      );
    case "dnc_cleared":
      return "Internal Do-Not-Contact flag cleared";
    case "exported":
      return (
        <>
          Exported to CSV (batch of {String(detail.batchSize ?? "?")}){" "}
          <span className="font-mono text-[11px] text-[#7a8aa0]">
            {String(detail.filename ?? "")}
          </span>
        </>
      );
    case "quote_response":
      return (
        <span className="text-emerald-300">
          ★ Responded via /quote form
          {detail.batchCode ? (
            <>
              {" "}
              <span className="font-mono text-[11px] text-[#cfd9e5]">
                (batch {String(detail.batchCode)})
              </span>
            </>
          ) : null}
        </span>
      );
    default:
      return e.kind;
  }
}

function formatActivityTime(d: Date): string {
  const now = Date.now();
  const t = d.getTime();
  const sec = Math.floor((now - t) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#1d3554] py-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-[#7a8aa0]">
        {label}
      </dt>
      <dd
        className={`text-right text-[#cfd9e5] ${mono ? "font-mono text-[12px]" : ""}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
