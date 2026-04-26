"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  Card,
  Field,
  Input,
  SecondaryButton,
} from "../../_components/ui";
import { regenerateRecoveryCodesAction } from "./actions";

type ActionResult = { error: string | null; codes?: string[] };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <SecondaryButton type="submit" disabled={pending}>
      {pending ? "Generating…" : "Generate new recovery codes"}
    </SecondaryButton>
  );
}

export function RegenerateCodesSection() {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    regenerateRecoveryCodesAction,
    { error: null },
  );

  return (
    <Card className="p-6">
      <h3 className="mb-2 text-base font-semibold text-white">
        Recovery codes
      </h3>
      <p className="mb-4 text-sm text-[#cfd9e5]">
        Generating new codes immediately invalidates the old set. Save the new
        ones before closing this page — they won&rsquo;t be shown again.
      </p>

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.codes ? (
        <>
          <Alert tone="warn">
            New codes generated. Save them now — we won&rsquo;t show them again.
          </Alert>
          <pre className="my-4 grid grid-cols-2 gap-x-8 gap-y-1 rounded-md border border-[#1d3554] bg-[#0b1a2e] p-5 text-center font-mono text-base tracking-wider text-white">
            {state.codes.map((c) => (
              <code key={c}>{c}</code>
            ))}
          </pre>
          <SecondaryButton
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(state.codes!.join("\n"));
            }}
          >
            Copy all
          </SecondaryButton>
        </>
      ) : null}

      <form action={formAction} className={state.codes ? "mt-6" : ""}>
        <Field label="Current password">
          <Input
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Submit />
      </form>
    </Card>
  );
}
