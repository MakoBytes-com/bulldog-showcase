import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { Card } from "../../../_components/ui";

export const dynamic = "force-dynamic";

function formatDate(d: Date | string | null) {
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

export default async function BatchesPage() {
  // One query per batch's response count would N+1 us. Instead we
  // fetch all batches, then a single grouped count of responses by
  // batch_code, then join in JS.
  const [batches, responseCounts, users] = await Promise.all([
    db
      .select()
      .from(schema.mailBatches)
      .orderBy(desc(schema.mailBatches.exportedAt))
      .limit(200),
    db
      .select({
        batchCode: schema.quoteResponses.batchCode,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.quoteResponses)
      .groupBy(schema.quoteResponses.batchCode),
    db
      .select({
        id: schema.users.id,
        name: schema.users.name,
      })
      .from(schema.users),
  ]);

  const responseByCode = new Map<string, number>();
  for (const r of responseCounts) {
    if (r.batchCode) responseByCode.set(r.batchCode, r.count);
  }
  const userById = new Map<number, string>();
  for (const u of users) userById.set(u.id, u.name);

  const totalLeads = batches.reduce((s, b) => s + b.leadCount, 0);
  const totalResponses = batches.reduce(
    (s, b) => s + (responseByCode.get(b.code) ?? 0),
    0,
  );
  const overallRate =
    totalLeads > 0 ? ((totalResponses / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Mail batches</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          Every CSV export creates a tracked batch. The batch code rides
          with each piece (printed on the postcard or as the QR-code URL{" "}
          <span className="font-mono text-[12px] text-[#4fa8e0]">
            /quote?b=&lt;code&gt;
          </span>
          ) so we can attribute every form response back to the drop that
          drove it.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Batches" value={batches.length.toLocaleString()} />
          <Stat label="Mailed" value={totalLeads.toLocaleString()} />
          <Stat
            label="Response rate"
            value={`${overallRate}%`}
            sub={`${totalResponses.toLocaleString()} responses`}
          />
        </div>
      </Card>

      {batches.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-base font-semibold text-white">
            No mail batches yet
          </h3>
          <p className="mt-2 text-sm text-[#cfd9e5]">
            Export some leads from{" "}
            <Link
              href="/admin/sales/home-sales"
              className="text-[#4fa8e0] underline-offset-4 hover:underline"
            >
              New Home Sales
            </Link>{" "}
            or{" "}
            <Link
              href="/admin/sales/businesses"
              className="text-[#4fa8e0] underline-offset-4 hover:underline"
            >
              New Businesses
            </Link>{" "}
            and the resulting CSV drop will appear here as a tracked batch.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="px-5 py-3 font-medium">Batch</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 text-right font-medium">Mailed</th>
                <th className="px-5 py-3 text-right font-medium">Responses</th>
                <th className="px-5 py-3 text-right font-medium">Rate</th>
                <th className="px-5 py-3 font-medium">Exported</th>
                <th className="px-5 py-3 font-medium">By</th>
                <th className="px-3 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d3554]">
              {batches.map((b) => {
                const responses = responseByCode.get(b.code) ?? 0;
                const rate =
                  b.leadCount > 0
                    ? ((responses / b.leadCount) * 100).toFixed(1)
                    : "0.0";
                const userName = userById.get(b.exportedByUserId) ?? "—";
                return (
                  <tr key={b.id} className="text-[#cfd9e5] hover:bg-[#0e2b5c]/40">
                    <td className="px-5 py-3 font-mono text-xs text-white">
                      {b.code}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {b.source === "home-sale" ? "Home sale" : "Business"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {b.leadCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {responses > 0 ? (
                        <span className="font-semibold text-emerald-300">
                          {responses}
                        </span>
                      ) : (
                        <span className="text-[#7a8aa0]">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs">
                      {rate}%
                    </td>
                    <td className="px-5 py-3 text-xs text-[#7a8aa0]">
                      {formatDate(b.exportedAt)}
                    </td>
                    <td className="px-5 py-3 text-xs">{userName}</td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/admin/sales/batches/${b.code}`}
                        className="inline-block whitespace-nowrap rounded-md border border-[#1d3554] bg-[#0b1a2e] px-2.5 py-1 text-xs font-medium text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white"
                      >
                        Open&nbsp;→
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-[#1d3554] bg-[#0b1a2e] p-4">
      <div className="text-[10px] uppercase tracking-widest text-[#7a8aa0]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-[#7a8aa0]">{sub}</div> : null}
    </div>
  );
}
