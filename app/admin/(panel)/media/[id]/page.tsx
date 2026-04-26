import { notFound } from "next/navigation";

import { getMediaById } from "@/lib/db/queries";
import {
  Card,
  DangerButton,
  Field,
  Input,
  PageHeader,
  PrimaryButton,
  SecondaryLink,
} from "../../../_components/ui";
import { deleteMediaAction, updateMediaMetaAction } from "../actions";

export const metadata = { title: "Media item" };

function isImage(mimeType: string | null | undefined): boolean {
  return Boolean(mimeType?.startsWith("image/"));
}

function humanBytes(raw: string | number | null | undefined): string {
  const n = typeof raw === "string" ? Number(raw) : (raw ?? 0);
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) notFound();

  const m = await getMediaById(id);
  if (!m) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={m.filename ?? "Media"}
        subtitle={`${m.mimeType ?? "unknown type"} · ${humanBytes(m.filesize)}`}
        actions={<SecondaryLink href="/admin/media">← All media</SecondaryLink>}
      />

      <Card className="mb-6 overflow-hidden">
        {isImage(m.mimeType) && m.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.url}
            alt={m.alt ?? m.filename ?? ""}
            className="block w-full"
          />
        ) : (
          <div className="p-6">
            <a
              href={m.url ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-[#3a94d6] hover:text-white"
            >
              Open file ↗
            </a>
          </div>
        )}
      </Card>

      <Card className="mb-6 p-6">
        <form action={updateMediaMetaAction}>
          <input type="hidden" name="id" value={m.id} />
          <Field label="Alt text">
            <Input name="alt" defaultValue={m.alt ?? ""} />
          </Field>
          <Field label="Caption">
            <Input name="caption" defaultValue={m.caption ?? ""} />
          </Field>
          <PrimaryButton type="submit">Save changes</PrimaryButton>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-xs uppercase tracking-wider text-[#7a8aa0]">
          Asset URL
        </h3>
        <div className="mb-4 break-all rounded-md border border-[#1d3554] bg-[#0b1a2e] p-3 font-mono text-xs text-[#cfd9e5]">
          {m.url ?? "—"}
        </div>
        <p className="text-xs text-[#7a8aa0]">
          Copy this URL to reference the file from a post or case study.
        </p>
      </Card>

      <div className="mt-8 border-t border-[#1d3554] pt-6">
        <form action={deleteMediaAction}>
          <input type="hidden" name="id" value={m.id} />
          <DangerButton type="submit">Delete this file</DangerButton>
        </form>
      </div>
    </div>
  );
}
