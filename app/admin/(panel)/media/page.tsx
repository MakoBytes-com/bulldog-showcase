import Link from "next/link";

import { listMedia } from "@/lib/db/queries";
import {
  Card,
  EmptyState,
  PageHeader,
} from "../../_components/ui";
import { uploadMediaAction } from "./actions";
import { UploadForm } from "./UploadForm";

export const metadata = { title: "Media" };

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

export default async function MediaPage() {
  const rows = await listMedia();

  return (
    <div>
      <PageHeader
        title="Media"
        subtitle={`${rows.length} ${rows.length === 1 ? "item" : "items"}`}
      />

      <UploadForm action={uploadMediaAction} />

      {rows.length === 0 ? (
        <EmptyState
          title="No media yet"
          description="Upload your first image, video, or PDF using the form above."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((m) => (
            <Link
              key={m.id}
              href={`/admin/media/${m.id}`}
              className="group overflow-hidden rounded-lg border border-[#1d3554] bg-[#112740] transition hover:border-[#3a94d6]"
            >
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#0b1a2e]">
                {isImage(m.mimeType) && m.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.alt ?? m.filename ?? "Upload"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-2xl">📄</div>
                    <div className="mt-1 text-xs text-[#cfd9e5] break-all">
                      {m.mimeType}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-medium text-white">
                  {m.filename ?? "Untitled"}
                </div>
                <div className="truncate text-xs text-[#7a8aa0]">
                  {humanBytes(m.filesize)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
