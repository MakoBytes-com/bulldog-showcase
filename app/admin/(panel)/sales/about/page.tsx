import { Card } from "../../../_components/ui";

export const metadata = { title: "How the Sales Pipeline Works" };

export default function SalesAboutPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">
          How the lead pipeline works
        </h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          End-to-end view of where leads come from, how they&rsquo;re
          enriched with addresses, and how this stacks up against
          competitors and paid list brokers.
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Step 1 &mdash; Scrape Harris County Clerk daily
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-[#3a94d6]">●</span> Source:{" "}
            <a
              href="https://www.cclerk.hctx.net/applications/websearch/RP.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[#4fa8e0] underline-offset-4 hover:underline"
            >
              cclerk.hctx.net Real Property Records
            </a>
            {" "}&mdash; the official Harris County Clerk public deed database.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Cron runs every day
            at 8am Houston time. Looks back 7 days to catch the typical
            1&ndash;2 day Clerk index lag.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Queries one day at
            a time with instrument filter <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">DEED</code> &mdash;
            beats the portal&rsquo;s 200-record-per-query cap.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Captures: file
            number, date, grantor list, grantee list, subdivision,
            section, lot, block, abstract, tract.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Filters out commercial
            transfers (any grantee name containing LLC / INC / CORP /
            TRUST / HOLDINGS / PROPERTIES / PARTNERS / etc.) and
            non-deed types (easements, releases, mortgages).
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Dedupes on file
            number so re-scrapes never create duplicates.
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Step 2 &mdash; HCAD address enrichment (the address problem)
        </h3>
        <p className="mt-3 text-sm text-[#cfd9e5]">
          Deeds use legal descriptions (&ldquo;Lot 18 Block 62 Brookforest&rdquo;),
          never street addresses. Street addresses live at the appraisal
          district. We pull them from HCAD&rsquo;s public ArcGIS Parcels
          layer at{" "}
          <a
            href="https://arcweb.hcad.org/server/rest/services/public/public_query/MapServer/0"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[#4fa8e0] underline-offset-4 hover:underline"
          >
            arcweb.hcad.org
          </a>
          .
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-[#3a94d6]">●</span> <strong>Strategy 1:</strong>{" "}
            search HCAD by every grantee name on the deed. Many
            family/co-buyer deeds have multiple grantees; one usually
            has prior HCAD history.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> <strong>Strategy 2 (fallback):</strong>{" "}
            search HCAD by subdivision name + filter results by lot/block
            in HCAD&rsquo;s legal-description text. Works even when HCAD
            hasn&rsquo;t indexed the new buyer yet &mdash; the parcel itself has
            been on the books for years under the prior owner. We just
            need its address.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Re-runs daily so
            leads that didn&rsquo;t match today get retried tomorrow as
            HCAD updates owner records (worst case lag is ~30&ndash;60 days).
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Current match rate
            is ~60% on first attempt, climbing toward ~85% after a few
            weeks of HCAD updates.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> The panel hides
            unenriched leads &mdash; sales team only sees actionable rows
            with real street addresses.
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Step 3 &mdash; Compliance gates (mail-first by default)
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-[#3a94d6]">●</span> Every lead row
            carries flags: <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">consent_to_call</code>,{" "}
            <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">dnc_flagged</code>,{" "}
            <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">internal_do_not_contact</code>.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Default route is
            mail-only. Postcards bypass federal DNC and TCPA entirely;
            no compliance registration needed.
          </li>
          <li>
            <span className="text-[#3a94d6]">●</span> Phone outreach is
            disabled until federal DNC scrub is wired (deferred until
            Bulldog registers at telemarketing.donotcall.gov + provides
            ADT Authorized Dealer Compliance Handbook).
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          How this compares to competitors and list brokers
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="py-2 pr-4 font-medium">Source</th>
                <th className="py-2 pr-4 font-medium">Speed to Bulldog</th>
                <th className="py-2 pr-4 font-medium">Cost</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1d3554] text-[#cfd9e5]">
              <tr>
                <td className="py-3 pr-4 font-medium text-white">
                  Bulldog (this pipeline)
                </td>
                <td className="py-3 pr-4">
                  Same day Clerk records<br />(typically D+1 due to lag)
                </td>
                <td className="py-3 pr-4 text-emerald-300">$0</td>
                <td className="py-3 text-xs text-[#7a8aa0]">
                  Direct scrape + HCAD enrichment. Mail-only by default.
                  No skip-tracing for phone/email.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">
                  ATTOM Data / RealtyTrac
                </td>
                <td className="py-3 pr-4">D+1 (same source as us)</td>
                <td className="py-3 pr-4 text-rose-300">$300+/mo subscription</td>
                <td className="py-3 text-xs text-[#7a8aa0]">
                  Pre-enriched with skip-tracing. National coverage.
                  Used by big alarm companies + national mailers.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">
                  NeighborGood / Take5Solutions
                </td>
                <td className="py-3 pr-4">D+3 to D+7</td>
                <td className="py-3 pr-4 text-rose-300">$0.10&ndash;$1 / record</td>
                <td className="py-3 text-xs text-[#7a8aa0]">
                  &ldquo;New mover&rdquo; lists shipped weekly to subscribers (alarm,
                  pest, HVAC, lawn). Slower than direct scrape.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">
                  Vivint / SimpliSafe / Brinks
                </td>
                <td className="py-3 pr-4">D+1 to D+7</td>
                <td className="py-3 pr-4 text-rose-300">List broker fees</td>
                <td className="py-3 text-xs text-[#7a8aa0]">
                  Buy from list brokers above. Hit the same leads with
                  national-template direct mail and call centers.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">
                  ADT Corp (national)
                </td>
                <td className="py-3 pr-4">Variable</td>
                <td className="py-3 pr-4 text-rose-300">Internal data + brokers</td>
                <td className="py-3 text-xs text-[#7a8aa0]">
                  Large-scale national targeting. Less local-flavor in
                  copy than Bulldog can do.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-white">
                  MLS / Realtors
                </td>
                <td className="py-3 pr-4 text-emerald-300">
                  D&minus;30 to D&minus;60 (BEFORE close!)
                </td>
                <td className="py-3 pr-4 text-rose-300">
                  Realtor partnership / IDX feed
                </td>
                <td className="py-3 text-xs text-[#7a8aa0]">
                  See pending contracts before the deed records. Only
                  way to truly beat us to the punch. Future Phase 2.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          Where Bulldog actually wins
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-emerald-300">●</span> <strong>Cost.</strong>{" "}
            $0 vs $300&ndash;$3,000/mo for list brokers. Real money over a year.
          </li>
          <li>
            <span className="text-emerald-300">●</span> <strong>Speed-to-mail.</strong>{" "}
            Same-day-as-Clerk vs broker subscribers&rsquo; weekly batches.
            That 2&ndash;3 day window when &ldquo;set up the new house&rdquo; is top of
            mind is where conversion edge actually lives.
          </li>
          <li>
            <span className="text-emerald-300">●</span> <strong>Local copy.</strong>{" "}
            We can write &ldquo;Welcome to Brookforest!&rdquo; postcards
            tied to the actual subdivision name. National lists send
            generic templates.
          </li>
          <li>
            <span className="text-emerald-300">●</span> <strong>Owned pipeline.</strong>{" "}
            No broker contract to renew, no per-record fee as volume grows.
            Targeting (zip codes, price ranges from HCAD&rsquo;s appraised value)
            iterates freely.
          </li>
          <li>
            <span className="text-emerald-300">●</span> <strong>ADT compliance baked in.</strong>{" "}
            Mail-only default keeps Bulldog clear of TCPA/DNC issues
            that have historically burned ADT dealers.
          </li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-white">
          What Bulldog doesn&rsquo;t get from this pipeline
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[#cfd9e5]">
          <li>
            <span className="text-rose-300">●</span> <strong>No phone or email.</strong>{" "}
            Public records have names + addresses, never contact info.
            Skip-tracing API ($0.10/lookup) can be wired in later if
            phone outreach is wanted.
          </li>
          <li>
            <span className="text-rose-300">●</span> <strong>No pending-contract lead time.</strong>{" "}
            Only Realtors with MLS access see pending contracts
            30&ndash;60 days before close. To get that edge would
            require a Realtor partnership.
          </li>
          <li>
            <span className="text-rose-300">●</span> <strong>Harris County only (today).</strong>{" "}
            Same scraper pattern can extend to Dallas, Tarrant, Bexar,
            Travis &mdash; each county is its own portal, ~200-line build per county.
          </li>
        </ul>
      </Card>
    </div>
  );
}
