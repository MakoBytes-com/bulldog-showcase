"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";
import { logLeadEventsBulk } from "@/lib/db/leadEvents";

export type ExportResult =
  | { ok: true; csv: string; filename: string; count: number }
  | { ok: false; error: string };

export type BulkStatusResult =
  | { ok: true; count: number; status: string }
  | { ok: false; error: string };

type LeadSource = "home-sale" | "business-filing";

const VALID_BULK_STATUSES = [
  "saved",
  "mailed",
  "contacted",
  "quoted",
  "won",
  "dead",
] as const;
type BulkStatus = (typeof VALID_BULK_STATUSES)[number];

/**
 * Export selected leads to a print-and-mail-ready CSV and mark them
 * as `mailed`. Works for both home-sales and business-filings; the
 * `source` filter prevents accidentally exporting leads from a
 * different source if IDs collide across runs.
 *
 * CSV columns are universal: works for direct mail vendors
 * (Click2Mail / Lob / MailMyStatements / local printers) AND maps
 * cleanly to Salesforce Lead fields via Data Loader / Data Import
 * Wizard.
 */
export async function exportSelectedAction(
  leadIds: number[],
  source: LeadSource,
): Promise<ExportResult> {
  const userId = await requireAdminUserId();

  const ids = leadIds.filter((n) => Number.isFinite(n) && n > 0);
  if (ids.length === 0) {
    return { ok: false, error: "No leads selected." };
  }

  const rows = await db
    .select()
    .from(schema.salesLeads)
    .where(
      and(
        eq(schema.salesLeads.source, source),
        inArray(schema.salesLeads.id, ids),
        sql`${schema.salesLeads.address} ~ '^[0-9]'`,
      ),
    );

  if (rows.length === 0) {
    return { ok: false, error: "No mailable leads in selection." };
  }

  // Different column set per source so each export carries the right
  // context for follow-up. Both shapes still slot cleanly into
  // Salesforce Lead fields (Company / FirstName/LastName / Street /
  // City / State / PostalCode).
  const isHome = source === "home-sale";
  const headers = isHome
    ? ["name", "address", "city", "state", "zip", "subdivision", "sale_date", "file_number"]
    : ["business_name", "address", "city", "state", "zip", "permit_issue_date", "first_sales_date", "taxpayer_name", "taxpayer_id"];

  function csvCell(v: unknown): string {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  const lines: string[] = [headers.join(",")];
  for (const r of rows) {
    const meta = (r.metadata ?? {}) as Record<string, unknown>;
    if (isHome) {
      const subdivision = typeof meta.description === "string" ? meta.description : "";
      const saleDate = typeof meta.fileDate === "string" ? meta.fileDate : "";
      lines.push(
        [
          csvCell(r.name),
          csvCell(r.address),
          csvCell(r.city),
          csvCell(r.state),
          csvCell(r.zip),
          csvCell(subdivision),
          csvCell(saleDate),
          csvCell(r.externalId),
        ].join(","),
      );
    } else {
      const issueDate = typeof meta.permitIssueDate === "string" ? meta.permitIssueDate : "";
      const firstSalesDate = typeof meta.firstSalesDate === "string" ? meta.firstSalesDate : "";
      const taxpayerName = typeof meta.taxpayerName === "string" ? meta.taxpayerName : "";
      const taxpayerNumber = typeof meta.taxpayerNumber === "string" ? meta.taxpayerNumber : "";
      lines.push(
        [
          csvCell(r.name),
          csvCell(r.address),
          csvCell(r.city),
          csvCell(r.state),
          csvCell(r.zip),
          csvCell(issueDate),
          csvCell(firstSalesDate),
          csvCell(taxpayerName),
          csvCell(taxpayerNumber),
        ].join(","),
      );
    }
  }
  const csv = lines.join("\n") + "\n";

  const exportedIds = rows.map((r) => r.id);
  await db
    .update(schema.salesLeads)
    .set({ status: "mailed", updatedAt: new Date() })
    .where(inArray(schema.salesLeads.id, exportedIds));

  const today = new Date().toISOString().slice(0, 10);
  const tag = isHome ? "homes" : "businesses";
  const filename = `bulldog-${tag}-${today}-${rows.length}.csv`;

  await logLeadEventsBulk({
    leadIds: exportedIds,
    userId,
    kind: "exported",
    detail: { batchSize: rows.length, filename },
  });

  revalidatePath("/admin/sales/home-sales");
  revalidatePath("/admin/sales/businesses");
  revalidatePath("/admin/sales/saved");
  revalidatePath("/admin/sales");

  return {
    ok: true,
    csv,
    filename,
    count: rows.length,
  };
}

/**
 * Bulk status update — mark every selected lead with the given status
 * in one go. Used for workflow polish: postcards delivered → mark
 * everyone Contacted; campaign closed without bites → mark Dead.
 * Logs a bulk_status_change event per lead so each lead's timeline
 * shows the action and who did it.
 */
export async function bulkUpdateStatusAction(
  leadIds: number[],
  source: LeadSource,
  status: string,
): Promise<BulkStatusResult> {
  const userId = await requireAdminUserId();

  const ids = leadIds.filter((n) => Number.isFinite(n) && n > 0);
  if (ids.length === 0) return { ok: false, error: "No leads selected." };

  if (!(VALID_BULK_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  const newStatus = status as BulkStatus;

  // Restrict to the source the user was viewing — defense against an
  // ID from one tab being applied to a lead in another source.
  const rows = await db
    .select({
      id: schema.salesLeads.id,
      status: schema.salesLeads.status,
    })
    .from(schema.salesLeads)
    .where(
      and(
        eq(schema.salesLeads.source, source),
        inArray(schema.salesLeads.id, ids),
      ),
    );

  if (rows.length === 0) {
    return { ok: false, error: "No matching leads found." };
  }

  const matchedIds = rows.map((r) => r.id);
  await db
    .update(schema.salesLeads)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(inArray(schema.salesLeads.id, matchedIds));

  // One log row per lead — the timeline shows every state transition,
  // so a bulk action that hit 50 leads creates 50 timeline entries
  // (each on its respective lead's history). detail.batchSize tells
  // the user "this was part of a batch of N". Done as a single
  // batched insert with per-row `from` status preserved.
  try {
    await db.insert(schema.salesLeadEvents).values(
      rows.map((r) => ({
        leadId: r.id,
        userId,
        kind: "bulk_status_change",
        detail: { from: r.status, to: newStatus, batchSize: rows.length },
      })),
    );
  } catch (err) {
    console.error("[bulkUpdateStatusAction] event log insert failed", err);
  }

  revalidatePath("/admin/sales/home-sales");
  revalidatePath("/admin/sales/businesses");
  revalidatePath("/admin/sales/saved");
  revalidatePath("/admin/sales");

  return { ok: true, count: rows.length, status: newStatus };
}
