import { notFound } from "next/navigation";

import { getTeamMember } from "@/lib/db/queries";
import { DangerButton, PageHeader } from "../../../_components/ui";
import { deleteTeamMemberAction, updateTeamMemberAction } from "../actions";
import { TeamForm } from "../TeamForm";

export const metadata = { title: "Edit team member" };

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) notFound();
  const row = await getTeamMember(id);
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`Edit: ${row.name}`} subtitle={row.role ?? undefined} />
      <TeamForm
        action={updateTeamMemberAction}
        mode="edit"
        initial={{
          id: row.id,
          name: row.name,
          role: row.role ?? "",
          bio: row.bio,
          email: row.email,
          linkedIn: row.linkedIn,
          order: row.order == null ? null : String(row.order),
        }}
      />
      <div className="mt-8 border-t border-[#1d3554] pt-6">
        <form action={deleteTeamMemberAction}>
          <input type="hidden" name="id" value={row.id} />
          <DangerButton type="submit">Delete this team member</DangerButton>
        </form>
      </div>
    </div>
  );
}
