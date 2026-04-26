import { listLeadsBySource } from "@/lib/db/salesQueries";

import { LeadsTable } from "../LeadsTable";

export const dynamic = "force-dynamic";

export default async function HomeSalesPage() {
  const leads = await listLeadsBySource("home-sale");

  return (
    <LeadsTable
      leads={leads}
      emptyTitle="No home-sale leads yet"
      emptyBody="Once the county-recorder scraper is wired and runs, residential property transfers within Bulldog's service zip codes will land here automatically. Planned source: Harris, Dallas, Tarrant, Bexar, Travis, Orange, and Hillsborough counties."
    />
  );
}
