"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  Card,
  Field,
  Input,
  PrimaryButton,
} from "../../_components/ui";
import { changeOwnPasswordAction } from "./actions";

type ActionResult = { error: string | null; ok: boolean };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending}>
      {pending ? "Updating…" : "Change password"}
    </PrimaryButton>
  );
}

export function PasswordSection() {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    changeOwnPasswordAction,
    { error: null, ok: false },
  );

  return (
    <Card className="p-6">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.ok ? <Alert tone="success">Password updated.</Alert> : null}
      <form action={formAction}>
        <Field label="Current password">
          <Input
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field label="New password" hint="At least 10 characters.">
          <Input
            name="password"
            type="password"
            minLength={10}
            autoComplete="new-password"
            required
          />
        </Field>
        <Field label="Confirm new password">
          <Input
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>
        <Submit />
      </form>
    </Card>
  );
}
