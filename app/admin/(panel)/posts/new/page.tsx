import { PageHeader } from "../../../_components/ui";
import { createPostAction } from "../actions";
import { PostForm } from "../PostForm";

export const metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div>
      <PageHeader title="New post" subtitle="Create a blog post." />
      <PostForm action={createPostAction} mode="create" />
    </div>
  );
}
