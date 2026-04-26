import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
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
    </div>
  );
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
