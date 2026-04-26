import Link from "next/link";
import { sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getRecentDeployments } from "@/lib/vercel";
import { RecentDeploymentsLive } from "./RecentDeploymentsLive";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();

  // Parallel counts for dashboard tiles.
  const [
    [[inbox], [posts], [team], [users], [media]],
    deployments,
  ] = await Promise.all([
    Promise.all([
      db
        .select({
          total: sql<number>`count(*)::int`,
          unhandled: sql<number>`count(*) filter (where handled is not true)::int`,
        })
        .from(schema.contactSubmissions),
      db
        .select({
          total: sql<number>`count(*)::int`,
          published: sql<number>`count(*) filter (where _status='published')::int`,
        })
        .from(schema.posts),
      db.select({ total: sql<number>`count(*)::int` }).from(schema.teamMembers),
      db.select({ total: sql<number>`count(*)::int` }).from(schema.users),
      db.select({ total: sql<number>`count(*)::int` }).from(schema.media),
    ]),
    getRecentDeployments(6),
  ]);

  const [errorStats] = await db
    .select({
      total24h: sql<number>`count(*) filter (where occurred_at > now() - interval '1 day')::int`,
      unresolved: sql<number>`count(*) filter (where resolved_at is null)::int`,
    })
    .from(schema.errorEvents);

  const tiles = [
    {
      href: "/admin/inbox",
      label: "Inbox",
      primary: `${inbox?.unhandled ?? 0} unread`,
      secondary: `${inbox?.total ?? 0} total submissions`,
      accent: (inbox?.unhandled ?? 0) > 0,
    },
    {
      href: "/admin/errors",
      label: "Errors",
      primary: `${errorStats?.unresolved ?? 0} open`,
      secondary: `${errorStats?.total24h ?? 0} in last 24h`,
      accent: (errorStats?.unresolved ?? 0) > 0,
    },
    {
      href: "/admin/posts",
      label: "Blog Posts",
      primary: `${posts?.published ?? 0} published`,
      secondary: `${posts?.total ?? 0} total`,
    },
    {
      href: "/admin/team",
      label: "Team",
      primary: `${team?.total ?? 0} members`,
      secondary: "Edit bios & photos",
    },
    {
      href: "/admin/media",
      label: "Media",
      primary: `${media?.total ?? 0} items`,
      secondary: "Images & uploads",
    },
    ...(session.role === "admin"
      ? [
          {
            href: "/admin/users",
            label: "Users",
            primary: `${users?.total ?? 0} accounts`,
            secondary: "Admins & editors",
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#3a94d6]">
          Welcome back
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-white">
          {session.name}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={`group rounded-xl border bg-[#112740] p-6 transition hover:-translate-y-0.5 hover:bg-[#152e4a] ${
              tile.accent
                ? "border-[#3a94d6] shadow-[0_0_0_1px_rgba(58,148,214,0.3)]"
                : "border-[#1d3554]"
            }`}
          >
            <div className="mb-2 text-sm uppercase tracking-widest text-[#7a8aa0]">
              {tile.label}
            </div>
            <div className="mb-1 text-2xl font-semibold text-white">
              {tile.primary}
            </div>
            <div className="text-sm text-[#cfd9e5]">{tile.secondary}</div>
          </Link>
        ))}
      </div>

      <RecentDeploymentsLive initialResult={deployments} />
    </div>
  );
}
