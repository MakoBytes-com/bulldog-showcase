import { notFound } from "next/navigation";

import { getFaq } from "@/lib/db/queries";
import { DangerButton, PageHeader } from "../../../_components/ui";
import { deleteFaqAction, updateFaqAction } from "../actions";
import { FaqForm } from "../FaqForm";

export const metadata = { title: "Edit FAQ" };

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) notFound();
  const row = await getFaq(id);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Edit FAQ" />
      <FaqForm
        action={updateFaqAction}
        mode="edit"
        initial={{
          id: row.id,
          question: row.question,
          answer: row.answer,
          category: row.category,
          order: row.order == null ? null : String(row.order),
        }}
      />
      <div className="mt-8 border-t border-[#1d3554] pt-6">
        <form action={deleteFaqAction}>
          <input type="hidden" name="id" value={row.id} />
          <DangerButton type="submit">Delete this FAQ</DangerButton>
        </form>
      </div>
    </div>
  );
}
