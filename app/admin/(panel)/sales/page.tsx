import { Card } from "../../_components/ui";

export default function SalesOverviewPage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">Overview</h2>
        <p className="mt-2 text-sm text-[#cfd9e5]">
          Lead sources roll up here once the scrapers are wired. For now,
          use the tabs above to jump to each source.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
            New Home Sales
          </div>
          <div className="mt-1 text-3xl font-semibold text-white">—</div>
          <p className="mt-2 text-sm text-[#cfd9e5]">
            Recent residential sales in Bulldog&rsquo;s service area.
            Source: county recorder of deeds.
          </p>
        </Card>

        <Card className="p-6">
          <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
            New Businesses
          </div>
          <div className="mt-1 text-3xl font-semibold text-white">—</div>
          <p className="mt-2 text-sm text-[#cfd9e5]">
            New business filings in TX + FL. Source: Secretary of State
            entity formations.
          </p>
        </Card>
      </div>
    </div>
  );
}
