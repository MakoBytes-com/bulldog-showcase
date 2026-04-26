import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { HQ, PHONES, SITE } from "@/lib/site";

import { PostcardSheet } from "./PostcardSheet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Postcards — print preview" };

export default async function PostcardsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const batchRows = await db
    .select()
    .from(schema.mailBatches)
    .where(eq(schema.mailBatches.code, code))
    .limit(1);
  const batch = batchRows[0];
  if (!batch) notFound();

  // Find every lead that was part of this batch via the export event
  // log (we record one "exported" event per lead with the batchCode in
  // detail). Filtering by source as well so a stale event from a
  // re-exported lead in another tab can't pull in foreign rows.
  const eventRows = await db
    .select({ leadId: schema.salesLeadEvents.leadId })
    .from(schema.salesLeadEvents)
    .where(
      and(
        eq(schema.salesLeadEvents.kind, "exported"),
        sql`${schema.salesLeadEvents.detail}->>'batchCode' = ${code}`,
      ),
    );

  const leadIds = Array.from(new Set(eventRows.map((r) => r.leadId)));
  const leads = leadIds.length
    ? await db
        .select()
        .from(schema.salesLeads)
        .where(
          and(
            inArray(schema.salesLeads.id, leadIds),
            eq(schema.salesLeads.source, batch.source),
          ),
        )
    : [];

  // One QR code per postcard, encoding the personalized landing URL.
  // Generated server-side so printing is instant and works offline.
  const trackingUrl = `${SITE.url}/quote?b=${batch.code}`;
  const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
    margin: 0,
    width: 200,
    errorCorrectionLevel: "M",
  });

  return (
    <PostcardSheet
      batchCode={batch.code}
      leads={leads}
      qrDataUrl={qrDataUrl}
      trackingUrl={trackingUrl}
      hq={{
        name: SITE.name,
        street: HQ.street,
        street2: HQ.street2 ?? null,
        city: HQ.city,
        state: HQ.state,
        zip: HQ.zip,
        phone: PHONES.main.number,
      }}
    />
  );
}
