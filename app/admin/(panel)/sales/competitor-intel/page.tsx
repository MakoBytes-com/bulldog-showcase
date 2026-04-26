import { desc } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { Card } from "../../../_components/ui";

export const dynamic = "force-dynamic";

function ratingColor(grade: string | null) {
  if (!grade) return "text-[#7a8aa0]";
  const first = grade.charAt(0);
  if (first === "A") return "text-emerald-300";
  if (first === "B") return "text-cyan-300";
  if (first === "C") return "text-amber-300";
  if (first === "D") return "text-orange-300";
  if (first === "F") return "text-rose-300";
  return "text-[#7a8aa0]";
}

function formatNumber(n: number | null) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString();
}

export default async function CompetitorIntelPage() {
  const rows = await db
    .select()
    .from(schema.competitorIntel)
    .orderBy(desc(schema.competitorIntel.totalComplaints));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Competitor Intel</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          Public BBB reputation stats for the residential-security brands
          Bulldog runs into in the Houston market. Use this as input for
          canvasser scripts and ad copy that honestly addresses the pain
          points customers actually report &mdash; <span className="font-medium text-white">never to identify or target individual reviewers</span>.
        </p>
        <p className="mt-3 text-xs text-[#7a8aa0]">
          Refreshed weekly via cron. Source: BBB Business Profiles
          (public). Numbers update slowly, so a stale-by-a-few-days
          snapshot is fine.
        </p>
      </Card>

      {rows.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-base font-semibold text-white">
            Not yet populated
          </h3>
          <p className="mt-2 text-sm text-[#cfd9e5]">
            The competitor scraper hasn&rsquo;t run yet. It runs weekly
            via Vercel Cron (Mondays 14:00 UTC). Wait for the first run
            or trigger it manually.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="px-5 py-3 font-medium">Competitor</th>
                <th className="px-5 py-3 text-right font-medium">BBB Rating</th>
                <th className="px-5 py-3 text-right font-medium">Complaints</th>
                <th className="px-5 py-3 text-right font-medium">Reviews</th>
                <th className="px-5 py-3 text-right font-medium">
                  Avg Review
                </th>
                <th className="px-5 py-3 text-right font-medium">Years</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d3554]">
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="text-[#cfd9e5] hover:bg-[#0e2b5c]/40"
                >
                  <td className="px-5 py-3">
                    <a
                      href={c.bbbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-white underline-offset-4 hover:underline"
                    >
                      {c.name}
                    </a>
                    {c.bbbAccredited ? (
                      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
                        BBB Accredited{" "}
                        {c.accreditedSince ? `since ${c.accreditedSince}` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`text-xl font-semibold ${ratingColor(c.bbbRating)}`}
                    >
                      {c.bbbRating ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[13px] text-rose-200">
                    {formatNumber(c.totalComplaints)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[13px]">
                    {formatNumber(c.totalReviews)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {c.averageReviewRating ? (
                      <span className="font-mono text-[13px] text-white">
                        {Number(c.averageReviewRating).toFixed(1)}
                        <span className="ml-1 text-xs text-[#7a8aa0]">/ 5</span>
                      </span>
                    ) : (
                      <span className="text-[#7a8aa0]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-[#7a8aa0]">
                    {c.yearsInBusiness ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          How to use this
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-[#3a94d6]">●</span> Click a competitor
            name to open their full BBB profile (recent complaints, complaint
            categories, reviews) in a new tab.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> The complaint count
            column is the headline number &mdash; high numbers point to
            recurring pain. Click into BBB to see the patterns: billing,
            service, contract, equipment.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Use the patterns
            (NOT individual complaints) to write canvasser opening lines
            and ad copy: <em>&ldquo;Tired of being on hold for an hour
            with your alarm company? Bulldog has a Houston office, you
            talk to a person.&rdquo;</em>
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> ADT-dealer compliance
            note: do <strong>not</strong> mention competitors by name in
            postcards or ads &mdash; use the pain-point language
            generically. Brand-disparagement clauses in dealer agreements
            apply.
          </li>
        </ul>
      </Card>
    </div>
  );
}
