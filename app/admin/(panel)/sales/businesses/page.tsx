import { Card } from "../../../_components/ui";

export default function BusinessesPage() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-white">New Businesses</h2>
      <p className="mt-2 text-sm text-[#cfd9e5]">
        Scraper not wired yet. Once configured, new business entity
        filings in Texas and Florida will land here with name, mailing
        address, registered agent, and filing date — primed for
        commercial-security outreach.
      </p>
      <p className="mt-4 text-xs text-[#7a8aa0]">
        Planned sources: Texas SOS Business Filings, Florida Sunbiz.
        Public records, free, weekly updates. Optionally enrich with
        county DBA filings + state contractor / liquor license
        issuances.
      </p>
    </Card>
  );
}
