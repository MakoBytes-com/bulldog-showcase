import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { Card } from "../../../../_components/ui";

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

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [batchRows, responses] = await Promise.all([
    db
      .select()
      .from(schema.mailBatches)
      .where(eq(schema.mailBatches.code, code))
      .limit(1),
    db
      .select()
      .from(schema.quoteResponses)
      .where(eq(schema.quoteResponses.batchCode, code))
      .orderBy(desc(schema.quoteResponses.createdAt)),
  ]);

  const batch = batchRows[0];
  if (!batch) notFound();

  const exporter = await db
    .select({ name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, batch.exportedByUserId))
    .limit(1);

  const responseRate =
    batch.leadCount > 0
      ? ((responses.length / batch.leadCount) * 100).toFixed(1)
      : "0.0";

  const matchedCount = responses.filter((r) => r.leadId !== null).length;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/sales/batches"
          className="text-sm text-[#4fa8e0] underline-offset-4 hover:underline"
        >
          ← Back to Mail Batches
        </Link>
      </div>

      <Card className="p-6">
        <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
          Mail batch
        </div>
        <h2 className="mt-1 font-mono text-2xl font-semibold text-white">
          {batch.code}
        </h2>
        <p className="mt-3 text-sm text-[#cfd9e5]">
          {batch.leadCount.toLocaleString()}{" "}
          {batch.source === "home-sale"
            ? "home-sale prospects"
            : "business prospects"}{" "}
          mailed by{" "}
          <span className="font-medium text-white">
            {exporter[0]?.name ?? "—"}
          </span>{" "}
          on{" "}
          <span className="font-medium text-white">
            {formatDate(batch.exportedAt)}
          </span>
          .
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Mailed" value={batch.leadCount.toLocaleString()} />
          <Stat
            label="Responses"
            value={responses.length.toLocaleString()}
            sub={
              responses.length > 0
                ? `${matchedCount} matched to lead`
                : "Track responses at /quote"
            }
          />
          <Stat label="Response rate" value={`${responseRate}%`} />
        </div>
        <div className="mt-5 rounded-lg border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-xs text-[#cfd9e5]">
          <span className="font-semibold uppercase tracking-widest text-[#7a8aa0]">
            CSV file:
          </span>{" "}
          <span className="font-mono">{batch.filename}</span>
        </div>
        <div className="mt-3 rounded-lg border border-[#3a94d6]/30 bg-[#0e2b5c]/40 px-4 py-3 text-xs text-[#cfd9e5]">
          <span className="font-semibold uppercase tracking-widest text-[#3a94d6]">
            Tracking URL:
          </span>{" "}
          <span className="font-mono text-white">
            /quote?b={batch.code}
          </span>{" "}
          <span className="text-[#7a8aa0]">
            — print this on the postcard / encode as a QR code so every
            response is auto-attributed back to this batch.
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Responses ({responses.length})
        </h3>
        {responses.length === 0 ? (
          <p className="mt-3 text-sm text-[#7a8aa0]">
            No responses yet. Once a postcard recipient submits the /quote
            form with this batch&rsquo;s code, they&rsquo;ll appear here
            and get auto-matched to their original lead row when possible.
          </p>
        ) : (
          <table className="mt-4 min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="py-2 font-medium">Submitted</th>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Contact</th>
                <th className="py-2 font-medium">Address</th>
                <th className="py-2 font-medium">Current provider</th>
                <th className="py-2 font-medium">Matched lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d3554]">
              {responses.map((r) => (
                <tr key={r.id} className="text-[#cfd9e5]">
                  <td className="py-2.5 text-xs text-[#7a8aa0]">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="py-2.5">
                    <div className="font-medium text-white">{r.name}</div>
                    {r.message ? (
                      <div className="mt-0.5 text-xs italic text-[#7a8aa0]">
                        &ldquo;{r.message.slice(0, 120)}
                        {r.message.length > 120 ? "…" : ""}&rdquo;
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2.5 text-xs">
                    {r.phone ? <div>{r.phone}</div> : null}
                    {r.email ? (
                      <div className="text-[#7a8aa0]">{r.email}</div>
                    ) : null}
                  </td>
                  <td className="py-2.5 text-xs">
                    {r.address ?? "—"}
                    {r.city || r.state ? (
                      <div className="text-[#7a8aa0]">
                        {[r.city, r.state, r.zip].filter(Boolean).join(", ")}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2.5 text-xs">
                    {r.currentProvider ?? "—"}
                  </td>
                  <td className="py-2.5 text-xs">
                    {r.leadId ? (
                      <Link
                        href={`/admin/sales/leads/${r.leadId}`}
                        className="text-[#4fa8e0] underline-offset-4 hover:underline"
                      >
                        Lead #{r.leadId}
                      </Link>
                    ) : (
                      <span className="text-[#7a8aa0]">No match</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
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
