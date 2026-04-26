import { listLeadsBySource } from "@/lib/db/salesQueries";

import { HomeSalesTable } from "./HomeSalesTable";

export const dynamic = "force-dynamic";

export default async function HomeSalesPage() {
  const leads = await listLeadsBySource("home-sale");

  return <HomeSalesTable leads={leads} />;
}
