import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { Card, PageHeader, Pill } from "../../../_components/ui";
import { reopenErrorGroupAction, resolveErrorGroupAction } from "../actions";

export const metadata = { title: "Error detail" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ErrorDetailPage({
  params,
}: {
  params: Promise<{ fingerprint: string }>;
}) {
  const { fingerprint } = await params;

  // Most recent occurrence drives the displayed module/message/stack
  const recentRows = await db
    .select()
    .from(schema.errorEvents)
    .where(eq(schema.errorEvents.fingerprint, fingerprint))
    .orderBy(desc(schema.errorEvents.occurredAt))
    .limit(50);

  if (recentRows.length === 0) notFound();

  const latest = recentRows[0];
  const total = recentRows.length;
  const unresolvedCount = recentRows.filter((r) => r.resolvedAt === null).length;
  const firstSeen = recentRows[recentRows.length - 1]?.occurredAt;
  const lastSeen = latest.occurredAt;
  const isErrorLevel = latest.level === "error";

  return (
    <div>
      <div className="mb-3">
        <Link href="/admin/errors" className="text-sm text-[#3a94d6] hover:underline">
          ← All errors
        </Link>
        <span className="mx-2 text-[#7a8aa0]">·</span>
        <span className="font-mono text-xs text-[#9fb0c7]">
          {fingerprint.slice(0, 12)}
        </span>
      </div>
      <PageHeader
        title={latest.message ?? "(no message)"}
        actions={
          unresolvedCount > 0 ? (
            <form action={resolveErrorGroupAction}>
              <input type="hidden" name="fingerprint" value={fingerprint} />
              <button
                type="submit"
                className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Resolve all {unresolvedCount} unresolved
              </button>
            </form>
          ) : (
            <form action={reopenErrorGroupAction}>
              <input type="hidden" name="fingerprint" value={fingerprint} />
              <button
                type="submit"
                className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
              >
                Reopen group
              </button>
            </form>
          )
        }
      />

      {/* Quick facts grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Severity">
          <Pill tone={isErrorLevel ? "danger" : "warn"}>{latest.level}</Pill>
        </Fact>
        <Fact label="Module" value={<span className="font-mono text-sm">{latest.module}</span>} />
        <Fact label="First seen" value={firstSeen ? formatDate(firstSeen) : "—"} />
        <Fact label="Last seen" value={lastSeen ? formatDate(lastSeen) : "—"} />
        <Fact label="Occurrences (recent 50)" value={String(total)} />
        <Fact
          label="Status"
          value={unresolvedCount === 0 ? <span className="text-emerald-300">All resolved</span> : <span className="text-red-300">{unresolvedCount} unresolved</span>}
        />
      </div>

      {/* Stack trace */}
      {latest.stack ? (
        <Card className="mb-6 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#7a8aa0]">
            Stack trace (latest occurrence)
          </h2>
          <pre className="overflow-x-auto rounded-md border border-[#1d3554] bg-[#0e2b5c] p-4 font-mono text-xs leading-relaxed text-[#cfd9e5]">
            {latest.stack}
          </pre>
        </Card>
      ) : null}

      {/* Context (latest occurrence) */}
      {latest.context && Object.keys(latest.context as object).length > 0 ? (
        <Card className="mb-6 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#7a8aa0]">
            Context
          </h2>
          <pre className="overflow-x-auto rounded-md border border-[#1d3554] bg-[#0e2b5c] p-4 font-mono text-xs text-[#cfd9e5]">
            {JSON.stringify(latest.context, null, 2)}
          </pre>
        </Card>
      ) : null}

      {/* Recent occurrences table */}
      <Card className="overflow-x-auto">
        <div className="border-b border-[#1d3554] px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#7a8aa0]">
            Recent occurrences
          </h2>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
            <tr>
              <th className="px-5 py-3 font-medium">When</th>
              <th className="px-5 py-3 font-medium">Severity</th>
              <th className="px-5 py-3 font-medium">Path</th>
              <th className="px-5 py-3 font-medium">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {recentRows.map((r) => (
              <tr key={r.id} className="border-b border-[#1d3554]/60 last:border-0">
                <td className="px-5 py-3 text-xs text-[#cfd9e5]">
                  {r.occurredAt ? formatDate(r.occurredAt) : "—"}
                </td>
                <td className="px-5 py-3">
                  <Pill tone={r.level === "error" ? "danger" : "warn"}>{r.level}</Pill>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-[#9fb0c7]">
                  {r.path ?? "—"}
                </td>
                <td className="px-5 py-3 text-xs text-[#9fb0c7]">
                  {r.resolvedAt ? formatDate(r.resolvedAt) : <span className="text-red-300">open</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Fact({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1d3554] bg-[#112740] p-4">
      <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">{label}</div>
      <div className="mt-1 text-sm text-white">{children ?? value}</div>
    </div>
  );
}

function formatDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  });
}
