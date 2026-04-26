"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { renderMarkdown } from "@/lib/content/markdown";

import {
  Alert,
  Card,
  Field,
  Input,
  PrimaryButton,
  SecondaryButton,
  SecondaryLink,
  Select,
  Textarea,
} from "../../_components/ui";

const CATEGORIES = [
  "Home Security",
  "Business Security",
  "Smart Home",
  "Industry News",
  "Tips & Guides",
] as const;

type ActionResult = { error: string | null };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </PrimaryButton>
  );
}

function toLocalDateTimeInput(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const tz = date.getTime() - date.getTimezoneOffset() * 60000;
  return new Date(tz).toISOString().slice(0, 16);
}

export function PostForm({
  action,
  mode,
  initial,
}: {
  action: Action;
  mode: "create" | "edit";
  initial?: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    contentMd: string | null;
    status: "draft" | "published" | null;
    publishedAt: Date | string | null;
  };
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    error: null,
  });
  const [contentMd, setContentMd] = useState<string>(initial?.contentMd ?? "");
  const [showPreview, setShowPreview] = useState(false);

  const previewHtml = useMemo(
    () => (showPreview ? renderMarkdown(contentMd) : ""),
    [showPreview, contentMd],
  );

  const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 225));

  return (
    <Card className="p-6">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <form action={formAction}>
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Field label="Title">
              <Input
                name="title"
                required
                defaultValue={initial?.title ?? ""}
                placeholder="How to pick the right MSP for a 20-seat office"
              />
            </Field>

            <Field
              label="Slug"
              hint="Auto-generated from title if left blank. Lowercase-kebab-case."
            >
              <Input
                name="slug"
                defaultValue={initial?.slug ?? ""}
                placeholder="pick-the-right-msp"
              />
            </Field>

            <Field label="Excerpt" hint="One or two sentences used on blog cards and OG images.">
              <Input
                name="excerpt"
                defaultValue={initial?.excerpt ?? ""}
                placeholder="A short summary that shows up on the blog index."
              />
            </Field>

            <Field
              label="Content (Markdown)"
              hint={`${words} words · ~${readMin} min read. **bold**, *italic*, [link](url), ## headings, - bullets, etc.`}
            >
              <Textarea
                name="content_md"
                value={contentMd}
                onChange={(e) => setContentMd(e.target.value)}
                className="min-h-[420px]"
                placeholder="## Your intro heading&#10;&#10;Write the post body here in Markdown."
              />
            </Field>

            <div className="-mt-2 mb-5 flex gap-3">
              <SecondaryButton
                type="button"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? "Hide preview" : "Show preview"}
              </SecondaryButton>
            </div>

            {showPreview ? (
              <div className="mb-5 rounded-md border border-[#1d3554] bg-[#0b1a2e] p-6">
                <div
                  className="mako-md-preview text-[15px] leading-7 text-[#cfd9e5]"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            ) : null}
          </div>

          <div>
            <Field label="Status">
              <Select
                name="status"
                defaultValue={initial?.status ?? "draft"}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>

            <Field label="Category">
              <Select name="category" defaultValue={initial?.category ?? ""}>
                <option value="">— none —</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Publish date"
              hint="Used in the feed and SEO. Leave blank to use 'now' when publishing."
            >
              <Input
                name="published_at"
                type="datetime-local"
                defaultValue={toLocalDateTimeInput(initial?.publishedAt ?? null)}
              />
            </Field>

            <div className="mt-6 flex flex-col gap-3">
              <Submit label={mode === "create" ? "Create post" : "Save changes"} />
              <SecondaryLink href="/admin/posts">Cancel</SecondaryLink>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
