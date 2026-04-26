import Link from "next/link";

import { listFaqs } from "@/lib/db/queries";
import {
  EmptyState,
  PageHeader,
  Pill,
  PrimaryLink,
} from "../../_components/ui";
import FaqSearchFilter from "./FaqSearchFilter";

export const metadata = { title: "FAQs" };

type Faq = Awaited<ReturnType<typeof listFaqs>>[number];

type Family = {
  id: string;
  label: string;
  match: (path: string | null) => boolean;
};

// Top-level grouping. The order here is the render order on the page.
// "Site-level" is anything not under /services, /industries, or /areas
// (e.g. /faq, /pricing, /the-bunker, plus an "Unassigned" bucket for
// rows still missing a page_path).
const FAMILIES: Family[] = [
  {
    id: "site",
    label: "Site-level pages",
    match: (p) =>
      !!p && !p.startsWith("/services") && !p.startsWith("/industries") && !p.startsWith("/areas"),
  },
  {
    id: "services",
    label: "Services",
    match: (p) => !!p && p.startsWith("/services"),
  },
  {
    id: "industries",
    label: "Industries",
    match: (p) => !!p && p.startsWith("/industries"),
  },
  {
    id: "areas",
    label: "Service areas",
    match: (p) => !!p && p.startsWith("/areas"),
  },
  {
    id: "unassigned",
    label: "Unassigned (no page yet)",
    match: (p) => !p,
  },
];

export default async function FaqsListPage() {
  const rows = await listFaqs();

  if (rows.length === 0) {
    return (
      <div>
        <PageHeader
          title="FAQs"
          subtitle="0 questions"
          actions={<PrimaryLink href="/admin/faqs/new">+ New FAQ</PrimaryLink>}
        />
        <EmptyState
          title="No FAQs"
          description="Add your first question."
          action={<PrimaryLink href="/admin/faqs/new">+ New FAQ</PrimaryLink>}
        />
      </div>
    );
  }

  // Group rows by page_path within each family.
  type PageBucket = { path: string | null; faqs: Faq[] };
  type FamilyBucket = { family: Family; pages: PageBucket[] };

  const familyBuckets: FamilyBucket[] = FAMILIES.map((family) => {
    const inFamily = rows.filter((r) => family.match(r.pagePath));
    const byPath = new Map<string | null, Faq[]>();
    for (const r of inFamily) {
      const key = r.pagePath ?? null;
      if (!byPath.has(key)) byPath.set(key, []);
      byPath.get(key)!.push(r);
    }
    const pages: PageBucket[] = Array.from(byPath.entries())
      .map(([path, faqs]) => ({ path, faqs }))
      .sort((a, b) => (a.path ?? "").localeCompare(b.path ?? ""));
    return { family, pages };
  }).filter((b) => b.pages.length > 0);

  return (
    <div>
      <PageHeader
        title="FAQs"
        subtitle={`${rows.length} questions across ${familyBuckets.reduce((n, b) => n + b.pages.length, 0)} pages`}
        actions={<PrimaryLink href="/admin/faqs/new">+ New FAQ</PrimaryLink>}
      />

      <FaqSearchFilter />

      <div className="space-y-3">
        {familyBuckets.map((bucket) => (
          <details
            key={bucket.family.id}
            data-faq-family={bucket.family.id}
            className="group/family overflow-hidden rounded-xl border border-[#1d3554] bg-[#0e2340]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between bg-[#0b1a2e] px-5 py-4 transition hover:bg-[#0a1729] group-open/family:border-b group-open/family:border-[#1d3554]">
              <div className="flex items-baseline gap-3">
                <h2 className="text-base font-semibold text-white">
                  {bucket.family.label}
                </h2>
                <span className="text-xs text-[#7a8aa0]">
                  {bucket.pages.length}{" "}
                  {bucket.pages.length === 1 ? "page" : "pages"} ·{" "}
                  {bucket.pages.reduce((n, p) => n + p.faqs.length, 0)} FAQs
                </span>
              </div>
              <span className="rounded-md border border-[#1d3554] bg-[#152e4a] px-3 py-1 text-xs font-semibold text-[#cfd9e5]">
                <span className="group-open/family:hidden">+ Expand</span>
                <span className="hidden group-open/family:inline">− Collapse</span>
              </span>
            </summary>

            <div className="space-y-2 p-3">
              {bucket.pages.map((page) => (
                // Native <details>/<summary> = no JS, accessible by default.
                // data-search-text is consumed by FaqSearchFilter.tsx.
                <details
                  key={page.path ?? "unassigned"}
                  data-faq-page={page.path ?? "unassigned"}
                  data-search-text={[
                    page.path ?? "",
                    ...page.faqs.map((f) => `${f.question} ${f.answer}`),
                  ]
                    .join(" ")
                    .toLowerCase()}
                  className="group overflow-hidden rounded-xl border border-[#1d3554] bg-[#112740]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between bg-[#0b1a2e]/50 px-5 py-3 transition hover:bg-[#0b1a2e] group-open:border-b group-open:border-[#1d3554]">
                    <span className="font-mono text-sm text-white">
                      {page.path ?? "(no page assigned)"}
                    </span>
                    <span className="rounded-md border border-[#1d3554] bg-[#152e4a] px-3 py-1 text-xs font-semibold text-[#cfd9e5]">
                      <span className="group-open:hidden">+ Expand</span>
                      <span className="hidden group-open:inline">− Collapse</span>
                    </span>
                  </summary>

                  {page.path && (
                    <div className="border-b border-[#1d3554]/60 bg-[#0b1a2e]/30 px-5 py-2 text-xs text-[#7a8aa0]">
                      {page.faqs.length}{" "}
                      {page.faqs.length === 1 ? "FAQ" : "FAQs"} ·{" "}
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noopener"
                        className="font-medium text-[#3a94d6] hover:text-white"
                      >
                        View live page ↗
                      </a>
                    </div>
                  )}

                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-[#1d3554]/60 text-xs uppercase tracking-wider text-[#7a8aa0]">
                      <tr>
                        <th className="w-12 px-5 py-2 font-medium">#</th>
                        <th className="px-5 py-2 font-medium">Question</th>
                        <th className="w-40 px-5 py-2 font-medium">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {page.faqs.map((f) => (
                        <tr
                          key={f.id}
                          className="border-b border-[#1d3554]/40 last:border-0 hover:bg-[#152e4a]"
                        >
                          <td className="px-5 py-3 text-[#cfd9e5]">
                            {f.order ?? "—"}
                          </td>
                          <td className="max-w-[60ch] px-5 py-3">
                            <Link
                              href={`/admin/faqs/${f.id}`}
                              className="block font-medium text-white"
                            >
                              {f.question}
                            </Link>
                            <div className="mt-1 line-clamp-1 text-xs text-[#7a8aa0]">
                              {f.answer}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {f.category ? <Pill>{f.category}</Pill> : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
