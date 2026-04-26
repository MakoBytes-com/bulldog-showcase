import { Card } from "../../_components/ui";
import { getLeadCounts } from "@/lib/db/salesQueries";

export const dynamic = "force-dynamic";

function sourceTotal(by: Record<string, number> | undefined) {
  if (!by) return 0;
  return Object.values(by).reduce((s, n) => s + n, 0);
}

export default async function SalesOverviewPage() {
  const { byKey, total } = await getLeadCounts();
  const homeSales = byKey["home-sale"] ?? {};
  const businesses = byKey["business-filing"] ?? {};

  const tiles = [
    {
      label: "New Home Sales",
      total: sourceTotal(homeSales),
      newCount: homeSales.new ?? 0,
      caption:
        "Recent residential property transfers in Bulldog's service area. Source: county recorder of deeds.",
    },
    {
      label: "New Businesses",
      total: sourceTotal(businesses),
      newCount: businesses.new ?? 0,
      caption:
        "New business filings in TX + FL. Source: TX SOS + FL Sunbiz entity formations.",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Pipeline overview</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          {total === 0
            ? "Scrapers aren't wired yet — once they run, fresh leads land here daily. Use the tabs to jump to each source."
            : `${total.toLocaleString()} total leads across all sources. Drill into a tab to triage.`}
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Card key={t.label} className="p-6">
            <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
              {t.label}
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-white">
                {t.total.toLocaleString()}
              </span>
              {t.newCount > 0 && (
                <span className="rounded-full bg-[#3a94d6]/20 px-2 py-0.5 text-xs font-medium text-[#3a94d6]">
                  {t.newCount} new
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#cfd9e5]">{t.caption}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Compliance posture
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-[#3a94d6]">●</span> Mail-first by default —
            postcards bypass TCPA + DNC entirely.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Phone-call buttons are
            disabled for leads that haven&rsquo;t been DNC-scrubbed.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Internal Do-Not-Contact
            list is honored across every source.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> ADT Authorized Dealer
            identification enforced in every outbound script + mail piece.
          </li>
        </ul>
        <p className="mt-4 text-xs text-[#7a8aa0]">
          ADT&rsquo;s dealer-specific rules (caller scripts, mail-piece
          approvals, brand standards) require pulling the current ADT
          Authorized Dealer Compliance Handbook from your ADT rep before
          phone-outreach features go live. Mail-only path can ship without
          that.
        </p>
      </Card>
    </div>
  );
}
