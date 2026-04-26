import { listLeadsBySource, type SortKey } from "@/lib/db/salesQueries";

import { SelectableLeadsTable } from "../SelectableLeadsTable";

export const dynamic = "force-dynamic";

const VALID_SORTS: SortKey[] = ["score", "value", "date"];

export default async function HomeSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; minValue?: string; sort?: string }>;
}) {
  const { page: pageStr, minValue: minValueStr, sort: sortStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const minValue = minValueStr ? parseInt(minValueStr, 10) : 0;
  const sort: SortKey = VALID_SORTS.includes(sortStr as SortKey)
    ? (sortStr as SortKey)
    : "score";
  const result = await listLeadsBySource("home-sale", page, { minValue, sort });

  return (
    <SelectableLeadsTable
      leads={result.leads}
      source="home-sale"
      page={result.page}
      totalPages={result.totalPages}
      totalDistinct={result.totalDistinct}
      basePath="/admin/sales/home-sales"
      minValue={minValue}
      sort={result.sort}
      emptyTitle="No home-sale leads with addresses yet"
      emptyBody="Once the daily Harris County scrape + HCAD enrichment runs, mailable residential transfers will land here."
      coverage={{
        label: "Harris County (Houston)",
        counties: ["Harris"],
        note: "Surrounding counties (Montgomery, Fort Bend, Brazoria, Galveston) on roadmap.",
      }}
    />
  );
}
