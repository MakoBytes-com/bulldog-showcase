import { PageHeader } from "../../../_components/ui";
import { createFaqAction } from "../actions";
import { FaqForm } from "../FaqForm";

export const metadata = { title: "New FAQ" };

export default function NewFaqPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New FAQ" />
      <FaqForm action={createFaqAction} mode="create" />
    </div>
  );
}
