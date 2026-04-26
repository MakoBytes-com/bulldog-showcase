import { listActiveLeads } from "@/lib/db/salesQueries";

import { LeadsTable } from "../LeadsTable";

export const dynamic = "force-dynamic";

export default async function SavedLeadsPage() {
  const leads = await listActiveLeads();

  return (
    <LeadsTable
      leads={leads}
      emptyTitle="No saved leads yet"
      emptyBody="Leads you save from the Home Sales or Businesses tabs land here. Each carries a status (saved → mailed → contacted → quoted → won / dead), notes, and next-action timestamps so the Bulldog sales team can work the pipeline without spreadsheets."
    />
  );
}
