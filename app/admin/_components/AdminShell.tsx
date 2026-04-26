import Link from "next/link";

import AdminSelfExclude from "./AdminSelfExclude";

type Role = "admin" | "editor";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles?: Role[];
  external?: boolean;
};

/** Main content nav — everything you manage day-to-day. */
const CONTENT_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/inbox", label: "Inbox", icon: "✉" },
  { href: "/admin/posts", label: "Posts", icon: "¶" },
  { href: "/admin/team", label: "Team", icon: "◉" },
  { href: "/admin/faqs", label: "FAQs", icon: "?" },
  { href: "/admin/media", label: "Media", icon: "▣" },
];

/** Operations nav — analytics, errors, review campaign, sales pipeline. */
const OPS_NAV: NavItem[] = [
  { href: "/admin/analytics", label: "Analytics", icon: "▲" },
  { href: "/admin/errors", label: "Errors", icon: "⚠" },
  { href: "/admin/review-campaign", label: "Reviews", icon: "★" },
  { href: "/admin/sales", label: "Sales", icon: "$" },
];

/** Admin-only nav — user management, settings later. */
const ADMIN_NAV: NavItem[] = [
  { href: "/admin/users", label: "Users", icon: "☰", roles: ["admin"] },
];

function NavSection({
  items,
  role,
}: {
  items: NavItem[];
  role: Role;
}) {
  const visible = items.filter(
    (item) => !item.roles || item.roles.includes(role),
  );
  if (visible.length === 0) return null;

  return (
    <div className="py-2">
      {visible.map((item) =>
        item.external ? (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3 text-[15px] text-[#cfd9e5] transition hover:bg-[#006fb9]/20 hover:text-white"
          >
            <span className="w-5 text-center text-base text-[#3a94d6]">
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            <span aria-hidden className="text-xs text-[#7a8aa0]">
              ↗
            </span>
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-5 py-3 text-[15px] text-[#cfd9e5] transition hover:bg-[#006fb9]/20 hover:text-white"
          >
            <span className="w-5 text-center text-base text-[#3a94d6]">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ),
      )}
    </div>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: { id: number; name: string; email: string; role: Role };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b1a2e] text-white">
      <AdminSelfExclude />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-[#1d3554] bg-[#0e2b5c] md:flex">
          <Link
            href="/admin"
            aria-label="Bulldog admin dashboard"
            className="flex flex-col items-center justify-center border-b border-[#1d3554] p-5 transition hover:bg-[#006fb9]/10"
          >
            <span className="font-display text-xl font-semibold text-white">
              Bulldog Admin
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#3a94d6]">
              Security Service
            </span>
          </Link>
          <nav className="flex-1 overflow-y-auto">
            <NavSection items={CONTENT_NAV} role={user.role} />
            <div className="mx-5 border-t border-[#1d3554]" />
            <NavSection items={OPS_NAV} role={user.role} />
            {user.role === "admin" ? (
              <>
                <div className="mx-5 border-t border-[#1d3554]" />
                <NavSection items={ADMIN_NAV} role={user.role} />
              </>
            ) : null}
          </nav>
          <div className="border-t border-[#1d3554] p-4 text-xs text-[#7a8aa0]">
            <Link
              href="/admin/profile"
              className="-mx-2 mb-3 block rounded-md px-2 py-2 transition hover:bg-[#006fb9]/15"
            >
              <div className="mb-0.5 truncate font-medium text-[#cfd9e5]">
                {user.name}
              </div>
              <div className="mb-1 truncate">{user.email}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#3a94d6]">
                {user.role} · My account →
              </div>
            </Link>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="w-full rounded-md border border-[#1d3554] bg-[#112740] px-3 py-2 text-sm text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[#1d3554] bg-[#0e2b5c] px-5 py-3 md:hidden">
            <Link
              href="/admin"
              aria-label="Bulldog admin dashboard"
              className="flex items-center"
            >
              <span className="font-display text-lg font-semibold text-white">
                Bulldog Admin
              </span>
            </Link>
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-md border border-[#1d3554] px-3 py-1 text-xs text-[#cfd9e5]"
              >
                Sign out
              </button>
            </form>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
