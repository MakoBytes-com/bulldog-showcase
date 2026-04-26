import { notFound } from "next/navigation";

import { getSubmission } from "@/lib/db/queries";
import {
  Card,
  DangerButton,
  PageHeader,
  Pill,
  PrimaryButton,
  SecondaryButton,
  SecondaryLink,
  Textarea,
} from "../../../_components/ui";
import {
  deleteSubmissionAction,
  saveNotesAction,
  toggleHandledAction,
} from "../actions";

export const metadata = { title: "Submission" };

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) notFound();

  const sub = await getSubmission(id);
  if (!sub) notFound();

  const fields: Array<[string, string | null]> = [
    ["Email", sub.email],
    ["Phone", sub.phone ?? null],
    ["Company", sub.company ?? null],
    ["Industry", sub.industry ?? null],
    ["Org size", sub.orgSize ?? null],
    ["Service need", sub.serviceNeed ?? null],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={sub.name}
        subtitle={`Submitted ${new Date(sub.createdAt).toLocaleString()}`}
        actions={
          <>
            <SecondaryLink href="/admin/inbox">← Inbox</SecondaryLink>
            <form action={toggleHandledAction}>
              <input type="hidden" name="id" value={sub.id} />
              <input
                type="hidden"
                name="handled"
                value={sub.handled ? "false" : "true"}
              />
              {sub.handled ? (
                <SecondaryButton type="submit">Mark as new</SecondaryButton>
              ) : (
                <PrimaryButton type="submit">Mark handled</PrimaryButton>
              )}
            </form>
          </>
        }
      />

      <div className="mb-4">
        {sub.handled ? (
          <Pill tone="success">Handled</Pill>
        ) : (
          <Pill tone="info">New</Pill>
        )}
      </div>

      <Card className="mb-4 p-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wider text-[#7a8aa0]">
                {label}
              </dt>
              <dd className="mt-1 text-[#cfd9e5] break-words">
                {value ? (
                  label === "Email" ? (
                    <a
                      className="text-[#3a94d6] hover:text-white"
                      href={`mailto:${value}`}
                    >
                      {value}
                    </a>
                  ) : label === "Phone" ? (
                    <a
                      className="text-[#3a94d6] hover:text-white"
                      href={`tel:${value}`}
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )
                ) : (
                  "—"
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {sub.message ? (
        <Card className="mb-4 p-6">
          <h3 className="mb-2 text-xs uppercase tracking-wider text-[#7a8aa0]">
            Message
          </h3>
          <p className="whitespace-pre-wrap text-[15px] text-white">
            {sub.message}
          </p>
        </Card>
      ) : null}

      <Card className="p-6">
        <h3 className="mb-2 text-xs uppercase tracking-wider text-[#7a8aa0]">
          Internal notes
        </h3>
        <form action={saveNotesAction}>
          <input type="hidden" name="id" value={sub.id} />
          <Textarea
            name="notes"
            defaultValue={sub.notes ?? ""}
            placeholder="Left voicemail 4/22, awaiting call back…"
          />
          <div className="mt-3">
            <PrimaryButton type="submit">Save notes</PrimaryButton>
          </div>
        </form>
      </Card>

      <div className="mt-6 border-t border-[#1d3554] pt-6">
        <form action={deleteSubmissionAction}>
          <input type="hidden" name="id" value={sub.id} />
          <DangerButton type="submit">Delete this submission</DangerButton>
        </form>
      </div>
    </div>
  );
}
