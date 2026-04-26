"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  Card,
  DangerButton,
  Field,
  Input,
} from "../../_components/ui";
import { disableTotpAction } from "./actions";

type ActionResult = { error: string | null; ok: boolean };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <DangerButton type="submit" disabled={pending}>
      {pending ? "Disabling…" : "Disable 2FA"}
    </DangerButton>
  );
}

export function DisableTotpSection() {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    disableTotpAction,
    { error: null, ok: false },
  );

  return (
    <Card className="p-6">
      <h3 className="mb-2 text-base font-semibold text-white">Disable 2FA</h3>
      <p className="mb-4 text-sm text-[#cfd9e5]">
        Turning this off weakens your account. Only do it if you&rsquo;re
        replacing the device or troubleshooting.
      </p>

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.ok ? (
        <Alert tone="success">
          2FA disabled. You can re-enable it anytime above.
        </Alert>
      ) : null}

      <form action={formAction}>
        <Field label="Current password">
          <Input
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field label="Current 6-digit code">
          <Input
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            autoComplete="one-time-code"
            required
            className="tracking-[0.4em] text-center text-xl"
          />
        </Field>
        <Submit />
      </form>
    </Card>
  );
}
