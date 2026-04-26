import Link from "next/link";

import { Card } from "../../_components/ui";
import { getLeadCounts } from "@/lib/db/salesQueries";

export const dynamic = "force-dynamic";

function sourceTotal(by: Record<string, number> | undefined) {
  if (!by) return 0;
  return Object.values(by).reduce((s, n) => s + n, 0);
}

export default async function SalesOverviewPage() {
  const { byKey, pendingByKey, total, pendingTotal } = await getLeadCounts();
  const homeSales = byKey["home-sale"] ?? {};
  const businesses = byKey["business-filing"] ?? {};

  const tiles = [
    {
      label: "New Home Sales",
      href: "/admin/sales/home-sales",
      total: sourceTotal(homeSales),
      newCount: homeSales.new ?? 0,
      pending: pendingByKey["home-sale"] ?? 0,
      coverage: "Harris County (Houston).",
      caption:
        "Address-confirmed residential transfers. Pending = awaiting HCAD address resolution (resolves over 30-60 days).",
    },
    {
      label: "New Businesses",
      href: "/admin/sales/businesses",
      total: sourceTotal(businesses),
      newCount: businesses.new ?? 0,
      pending: pendingByKey["business-filing"] ?? 0,
      coverage:
        "Houston metro 9-county area: Harris, Fort Bend, Montgomery, Brazoria, Galveston, Waller, Liberty, Chambers, San Jacinto.",
      caption:
        "Brand-new businesses with mailable street addresses. Source: Texas Comptroller — New Sales Tax Permits, daily refresh.",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Pipeline overview</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          {total === 0 && pendingTotal === 0
            ? "Scrapers aren't wired yet — once they run, fresh leads land here daily."
            : `${total.toLocaleString()} address-confirmed lead${total === 1 ? "" : "s"} ready to mail. ${pendingTotal.toLocaleString()} more awaiting HCAD address resolution.`}
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group block"
          >
            <Card className="p-6 transition group-hover:-translate-y-0.5 group-hover:border-[#3a94d6]/60">
              <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
                {t.label}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-semibold text-white">
                  {t.total.toLocaleString()}
                </span>
                <span className="text-xs text-[#7a8aa0]">
                  address-confirmed
                </span>
                {t.newCount > 0 && (
                  <span className="rounded-full bg-[#3a94d6]/20 px-2 py-0.5 text-xs font-medium text-[#3a94d6]">
                    {t.newCount} new
                  </span>
                )}
                {t.pending > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                    +{t.pending} pending
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#cfd9e5]">{t.caption}</p>
              <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-[#cfd9e5]">
                <span className="mr-1 font-semibold uppercase tracking-widest text-emerald-300">
                  Coverage:
                </span>
                {t.coverage}
              </div>
            </Card>
          </Link>
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
