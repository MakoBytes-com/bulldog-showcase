import { listLeadsBySource } from "@/lib/db/salesQueries";

import { LeadsTable } from "../LeadsTable";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const leads = await listLeadsBySource("business-filing");

  return (
    <LeadsTable
      leads={leads}
      emptyTitle="No business-filing leads yet"
      emptyBody="Once the SOS scrapers are wired, new entity formations in Texas (TX SOS) and Florida (Sunbiz) will land here weekly with name, mailing address, registered agent, and filing date."
    />
  );
}
