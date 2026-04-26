import { headers } from "next/headers";
import Link from "next/link";

import { PageHeader } from "../../_components/ui";

const TABS = [
  { href: "/admin/sales", label: "Overview" },
  { href: "/admin/sales/home-sales", label: "New Home Sales" },
  { href: "/admin/sales/businesses", label: "New Businesses" },
  { href: "/admin/sales/saved", label: "Saved Leads" },
] as const;

export const metadata = { title: "Sales" };

export default async function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the current path so we can highlight the active tab. The
  // root middleware sets x-pathname on every request.
  const pathname = (await headers()).get("x-pathname") ?? "/admin/sales";

  return (
    <div>
      <PageHeader
        title="Sales pipeline"
        subtitle="Lead sources, fresh prospects, and the saved-lead workspace."
      />

      <div className="mb-6 border-b border-[#1d3554]">
        <nav className="-mb-px flex flex-wrap gap-1">
          {TABS.map((t) => {
            const active =
              t.href === "/admin/sales"
                ? pathname === "/admin/sales"
                : pathname === t.href || pathname.startsWith(`${t.href}/`);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-[#3a94d6] text-white"
                    : "border-transparent text-[#cfd9e5] hover:border-[#1d3554] hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
