import { listLeadsBySource } from "@/lib/db/salesQueries";

import { SelectableLeadsTable } from "../SelectableLeadsTable";

export const dynamic = "force-dynamic";

export default async function HomeSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const result = await listLeadsBySource("home-sale", page);

  return (
    <SelectableLeadsTable
      leads={result.leads}
      source="home-sale"
      page={result.page}
      totalPages={result.totalPages}
      totalDistinct={result.totalDistinct}
      basePath="/admin/sales/home-sales"
      emptyTitle="No home-sale leads with addresses yet"
      emptyBody="Once the daily Harris County scrape + HCAD enrichment runs, mailable residential transfers will land here."
    />
  );
}
