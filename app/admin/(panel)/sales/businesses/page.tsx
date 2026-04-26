import { listLeadsBySource } from "@/lib/db/salesQueries";

import { SelectableLeadsTable } from "../SelectableLeadsTable";

export const dynamic = "force-dynamic";

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const result = await listLeadsBySource("business-filing", page);

  return (
    <SelectableLeadsTable
      leads={result.leads}
      source="business-filing"
      page={result.page}
      totalPages={result.totalPages}
      totalDistinct={result.totalDistinct}
      basePath="/admin/sales/businesses"
      emptyTitle="No business-filing leads yet"
      emptyBody="Once the daily Texas sales-tax-permits scrape runs, brand-new Houston-area businesses with mailable addresses will land here."
      coverage={{
        label: "Houston metro (greater 9-county area)",
        counties: [
          "Harris",
          "Fort Bend",
          "Montgomery",
          "Brazoria",
          "Galveston",
          "Waller",
          "Liberty",
          "Chambers",
          "San Jacinto",
        ],
        note: "Filtered by zip prefixes 770-778. Source: Texas Comptroller — covers every zip in TX, this filter narrows to Bulldog's service area.",
      }}
    />
  );
}
