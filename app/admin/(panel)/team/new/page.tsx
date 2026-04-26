import { PageHeader } from "../../../_components/ui";
import { createTeamMemberAction } from "../actions";
import { TeamForm } from "../TeamForm";

export const metadata = { title: "New team member" };

export default function NewTeamMemberPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New team member" />
      <TeamForm action={createTeamMemberAction} mode="create" />
    </div>
  );
}
