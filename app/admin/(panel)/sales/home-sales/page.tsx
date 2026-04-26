import { Card } from "../../../_components/ui";

export default function HomeSalesPage() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-white">New Home Sales</h2>
      <p className="mt-2 text-sm text-[#cfd9e5]">
        Scraper not wired yet. Once configured, residential property
        transfers within Bulldog&rsquo;s service zip codes will land here
        with sale date, address, buyer name, and (where available)
        contact info.
      </p>
      <p className="mt-4 text-xs text-[#7a8aa0]">
        Planned source: county recorder of deeds (Harris, Dallas,
        Tarrant, Bexar, Travis, Orange, Hillsborough). Public records,
        free, daily updates.
      </p>
    </Card>
  );
}
