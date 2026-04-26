import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Mako Admin",
    default: "Mako Admin",
  },
  robots: { index: false, follow: false },
};

// Admin is never statically cached — every request re-checks session + DB.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
