"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  Card,
  Field,
  Input,
  PrimaryButton,
} from "../../_components/ui";

type ActionResult = { error: string | null };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending}>
      {pending ? "Uploading…" : "Upload"}
    </PrimaryButton>
  );
}

export function UploadForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    error: null,
  });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="mb-6 p-6">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <form
        ref={formRef}
        action={(fd) => {
          formAction(fd);
          // Reset the file input between uploads — state.error will
          // hydrate from the server if upload fails.
          requestAnimationFrame(() => formRef.current?.reset());
        }}
        encType="multipart/form-data"
      >
        <Field label="File" hint="Images, MP4, or PDF. Up to 25 MB.">
          <input
            name="file"
            type="file"
            required
            accept="image/*,video/mp4,application/pdf"
            className="block w-full cursor-pointer rounded-md border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-base text-[#cfd9e5] file:mr-4 file:rounded-md file:border-0 file:bg-[#006fb9] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#3a94d6]"
          />
        </Field>
        <Field label="Alt text" hint="Short description used by screen readers and SEO.">
          <Input name="alt" placeholder="Bulldog Security technician installing a camera" />
        </Field>
        <Field label="Caption (optional)">
          <Input name="caption" />
        </Field>
        <Submit />
      </form>
    </Card>
  );
}
