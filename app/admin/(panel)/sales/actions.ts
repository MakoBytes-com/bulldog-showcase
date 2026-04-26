"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";

export type ExportResult =
  | { ok: true; csv: string; filename: string; count: number }
  | { ok: false; error: string };

type LeadSource = "home-sale" | "business-filing";

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
  await requireAdminUserId();

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

  await db
    .update(schema.salesLeads)
    .set({ status: "mailed", updatedAt: new Date() })
    .where(inArray(schema.salesLeads.id, rows.map((r) => r.id)));

  revalidatePath("/admin/sales/home-sales");
  revalidatePath("/admin/sales/businesses");
  revalidatePath("/admin/sales/saved");
  revalidatePath("/admin/sales");

  const today = new Date().toISOString().slice(0, 10);
  const tag = isHome ? "homes" : "businesses";
  return {
    ok: true,
    csv,
    filename: `bulldog-${tag}-${today}-${rows.length}.csv`,
    count: rows.length,
  };
}
