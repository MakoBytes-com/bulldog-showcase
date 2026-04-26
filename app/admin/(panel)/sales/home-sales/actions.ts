"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { requireAdminUserId } from "@/lib/auth/requireAdmin";

export type ExportResult =
  | { ok: true; csv: string; filename: string; count: number }
  | { ok: false; error: string };

/**
 * Take the selected lead IDs, generate a print-and-mail-ready CSV, and
 * mark those leads as `mailed` so they drop out of the Home Sales view
 * (they show up in Saved Leads under the "mailed" status from then on).
 *
 * CSV is the universal format every direct-mail house accepts (Click2Mail,
 * MailMyStatements, Lob's CSV upload, local printers). One row per lead;
 * columns are Bulldog's standard mailing fields plus the deed source data
 * for follow-up reference.
 */
export async function exportSelectedAction(
  leadIds: number[],
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
        eq(schema.salesLeads.source, "home-sale"),
        inArray(schema.salesLeads.id, ids),
        sql`${schema.salesLeads.address} ~ '^[0-9]'`,
      ),
    );

  if (rows.length === 0) {
    return { ok: false, error: "No mailable leads in selection." };
  }

  // Build CSV. Quote any field containing comma, quote, or newline.
  const headers = [
    "name",
    "address",
    "city",
    "state",
    "zip",
    "subdivision",
    "sale_date",
    "file_number",
  ];

  function csvCell(v: unknown): string {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const lines: string[] = [headers.join(",")];
  for (const r of rows) {
    const meta = (r.metadata ?? {}) as Record<string, unknown>;
    const subdivision = typeof meta.description === "string" ? meta.description : "";
    const saleDate = typeof meta.fileDate === "string" ? meta.fileDate : "";
    const fileNumber = r.externalId;
    lines.push(
      [
        csvCell(r.name),
        csvCell(r.address),
        csvCell(r.city),
        csvCell(r.state),
        csvCell(r.zip),
        csvCell(subdivision),
        csvCell(saleDate),
        csvCell(fileNumber),
      ].join(","),
    );
  }
  const csv = lines.join("\n") + "\n";

  // Mark them mailed.
  await db
    .update(schema.salesLeads)
    .set({ status: "mailed", updatedAt: new Date() })
    .where(inArray(schema.salesLeads.id, rows.map((r) => r.id)));

  revalidatePath("/admin/sales/home-sales");
  revalidatePath("/admin/sales/saved");
  revalidatePath("/admin/sales");

  const today = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    csv,
    filename: `bulldog-leads-${today}-${rows.length}.csv`,
    count: rows.length,
  };
}
