"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  Card,
  Field,
  Input,
  PrimaryButton,
  SecondaryLink,
  Textarea,
} from "../../_components/ui";

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

export function TeamForm({
  action,
  mode,
  initial,
}: {
  action: Action;
  mode: "create" | "edit";
  initial?: {
    id: number;
    name: string;
    role: string;
    bio: string | null;
    email: string | null;
    linkedIn: string | null;
    order: string | null;
  };
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    error: null,
  });

  return (
    <Card className="p-6">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <form action={formAction}>
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <Field label="Name">
          <Input name="name" required defaultValue={initial?.name ?? ""} />
        </Field>
        <Field label="Role / title">
          <Input
            name="role"
            required
            defaultValue={initial?.role ?? ""}
            placeholder="Principal Engineer, MSP Services"
          />
        </Field>
        <Field label="Bio">
          <Textarea name="bio" defaultValue={initial?.bio ?? ""} className="min-h-[120px]" />
        </Field>
        <Field label="Email">
          <Input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            placeholder="name@bulldogsecurityservice.com"
          />
        </Field>
        <Field label="LinkedIn URL">
          <Input
            name="linked_in"
            type="url"
            defaultValue={initial?.linkedIn ?? ""}
            placeholder="https://www.linkedin.com/in/username/"
          />
        </Field>
        <Field label="Display order" hint="Lower numbers appear first.">
          <Input
            name="order"
            type="number"
            inputMode="numeric"
            defaultValue={initial?.order ?? ""}
            placeholder="10"
          />
        </Field>
        <div className="mt-6 flex gap-3">
          <Submit label={mode === "create" ? "Create team member" : "Save changes"} />
          <SecondaryLink href="/admin/team">Cancel</SecondaryLink>
        </div>
      </form>
    </Card>
  );
}
