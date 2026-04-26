import { notFound } from "next/navigation";

import { getPost } from "@/lib/db/queries";
import {
  DangerButton,
  PageHeader,
  SecondaryLink,
} from "../../../_components/ui";
import { deletePostAction, updatePostAction } from "../actions";
import { PostForm } from "../PostForm";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) notFound();

  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div>
      <PageHeader
        title={post.title}
        subtitle={`/${post.slug} · updated ${new Date(post.updatedAt).toLocaleDateString()}`}
        actions={
          <>
            <SecondaryLink
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View live ↗
            </SecondaryLink>
            <SecondaryLink href="/admin/posts">← All posts</SecondaryLink>
          </>
        }
      />

      <PostForm
        action={updatePostAction}
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          category: post.category,
          contentMd: post.contentMd,
          status: post.status,
          publishedAt: post.publishedAt,
        }}
      />

      <div className="mt-8 border-t border-[#1d3554] pt-6">
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <DangerButton type="submit">Delete this post</DangerButton>
        </form>
      </div>
    </div>
  );
}
