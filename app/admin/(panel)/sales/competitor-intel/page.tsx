import { desc, eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import type { CompetitorComplaint } from "@/lib/db/schema";
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
  const [rows, allComplaints] = await Promise.all([
    db
      .select()
      .from(schema.competitorIntel)
      .orderBy(desc(schema.competitorIntel.totalComplaints)),
    db
      .select()
      .from(schema.competitorComplaints)
      .orderBy(desc(schema.competitorComplaints.scrapedAt))
      .limit(500),
  ]);

  const complaintsBySlug: Record<string, CompetitorComplaint[]> = {};
  for (const c of allComplaints) {
    if (!complaintsBySlug[c.competitorSlug]) {
      complaintsBySlug[c.competitorSlug] = [];
    }
    if (complaintsBySlug[c.competitorSlug].length < 5) {
      complaintsBySlug[c.competitorSlug].push(c);
    }
  }

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
        <div className="space-y-4">
          {rows.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <a
                    href={c.bbbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-white underline-offset-4 hover:underline"
                  >
                    {c.name}
                  </a>
                  {c.bbbAccredited ? (
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
                      BBB Accredited{" "}
                      {c.accreditedSince ? `since ${c.accreditedSince}` : ""}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-[#7a8aa0]">
                      BBB
                    </div>
                    <div
                      className={`mt-0.5 text-2xl font-semibold ${ratingColor(c.bbbRating)}`}
                    >
                      {c.bbbRating ?? "—"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-[#7a8aa0]">
                      Complaints
                    </div>
                    <div className="mt-0.5 font-mono text-lg font-semibold text-rose-200">
                      {formatNumber(c.totalComplaints)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-[#7a8aa0]">
                      Reviews
                    </div>
                    <div className="mt-0.5 font-mono text-lg text-[#cfd9e5]">
                      {formatNumber(c.totalReviews)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-[#7a8aa0]">
                      Years
                    </div>
                    <div className="mt-0.5 font-mono text-lg text-[#cfd9e5]">
                      {c.yearsInBusiness ?? "—"}
                    </div>
                  </div>
                </div>
              </div>
              {(complaintsBySlug[c.slug]?.length ?? 0) > 0 ? (
                <div className="mt-4 rounded-lg border border-[#1d3554] bg-[#0b1a2e] p-4">
                  <div className="mb-3 flex items-baseline justify-between">
                    <div className="text-[10px] uppercase tracking-widest text-amber-300">
                      Recent complaints (live from BBB)
                    </div>
                    <a
                      href={`${c.bbbUrl.replace(/\/?$/, "")}/complaints`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#4fa8e0] underline-offset-4 hover:underline"
                    >
                      All on BBB ↗
                    </a>
                  </div>
                  <div className="space-y-3">
                    {complaintsBySlug[c.slug].map((cmp) => (
                      <div
                        key={cmp.id}
                        className="border-l-2 border-rose-400/40 pl-3 text-sm"
                      >
                        <div className="mb-1 flex flex-wrap items-baseline gap-2 text-[11px] text-[#7a8aa0]">
                          {cmp.filedDate ? (
                            <span className="font-mono">{cmp.filedDate}</span>
                          ) : null}
                          {cmp.complaintType ? (
                            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-300">
                              {cmp.complaintType}
                            </span>
                          ) : null}
                          {cmp.status ? (
                            <span className="text-[#cfd9e5]">{cmp.status}</span>
                          ) : null}
                        </div>
                        <p className="text-[#cfd9e5]">
                          {cmp.body.length > 350
                            ? `${cmp.body.slice(0, 350)}…`
                            : cmp.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#7a8aa0]">
                  No complaints scraped yet for this competitor — the
                  next cron run will populate them.
                </p>
              )}
            </Card>
          ))}
        </div>
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
