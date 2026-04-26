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
  Select,
} from "../../_components/ui";

type ActionResult = { error: string | null };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <PrimaryButton type="submit" disabled={pending}>{pending ? "Saving…" : label}</PrimaryButton>;
}

export function UserForm({
  action,
  mode,
  initial,
}: {
  action: Action;
  mode: "create" | "edit";
  initial?: {
    id: number;
    email: string;
    name: string;
    role: "admin" | "editor";
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

        <Field label="Full name">
          <Input
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="Russell Sailors"
            autoComplete="name"
          />
        </Field>

        <Field label="Email">
          <Input
            name="email"
            type="email"
            required
            defaultValue={initial?.email ?? ""}
            placeholder="name@bulldogsecurityservice.com"
            autoComplete="email"
          />
        </Field>

        <Field label="Role" hint="Admins can manage content AND other users. Editors can manage content only.">
          <Select name="role" defaultValue={initial?.role ?? "editor"}>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>

        <Field
          label={mode === "create" ? "Password" : "New password"}
          hint={
            mode === "create"
              ? "At least 10 characters. Share with the user securely."
              : "Leave blank to keep the current password."
          }
        >
          <Input
            name="password"
            type="password"
            minLength={mode === "create" ? 10 : undefined}
            required={mode === "create"}
            autoComplete="new-password"
          />
        </Field>

        <div className="mt-6 flex gap-3">
          <Submit label={mode === "create" ? "Create user" : "Save changes"} />
          <SecondaryLink href="/admin/users">Cancel</SecondaryLink>
        </div>
      </form>
    </Card>
  );
}
