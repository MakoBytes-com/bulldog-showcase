import Link from "next/link";

import { listPosts } from "@/lib/db/queries";
import {
  Card,
  EmptyState,
  PageHeader,
  Pill,
  PrimaryLink,
} from "../../_components/ui";

export const metadata = { title: "Posts" };

export default async function PostsListPage() {
  const rows = await listPosts();

  return (
    <div>
      <PageHeader
        title="Blog posts"
        subtitle={
          rows.length
            ? `${rows.filter((r) => r.status === "published").length} published · ${rows.length} total`
            : "Nothing posted yet."
        }
        actions={<PrimaryLink href="/admin/posts/new">+ New post</PrimaryLink>}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No posts"
          description="Draft your first blog post."
          action={<PrimaryLink href="/admin/posts/new">+ New post</PrimaryLink>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1d3554] text-xs uppercase tracking-wider text-[#7a8aa0]">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[#1d3554]/60 last:border-0 hover:bg-[#152e4a]"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/posts/${p.id}`}
                      className="block w-full"
                    >
                      <div className="font-medium text-white">{p.title}</div>
                      <div className="text-xs text-[#7a8aa0]">/{p.slug}</div>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[#cfd9e5]">{p.category ?? "—"}</td>
                  <td className="px-5 py-4">
                    {p.status === "published" ? (
                      <Pill tone="success">Published</Pill>
                    ) : (
                      <Pill tone="warn">Draft</Pill>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#cfd9e5]">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
