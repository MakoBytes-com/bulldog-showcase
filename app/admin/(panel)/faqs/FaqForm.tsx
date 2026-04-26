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
  Textarea,
} from "../../_components/ui";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "monitoring", label: "Monitoring" },
  { value: "cameras", label: "Cameras" },
  { value: "smart-home", label: "Smart Home" },
  { value: "commercial", label: "Commercial" },
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

export function FaqForm({
  action,
  mode,
  initial,
}: {
  action: Action;
  mode: "create" | "edit";
  initial?: {
    id: number;
    question: string;
    answer: string;
    category: string | null;
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
        <Field label="Question">
          <Input
            name="question"
            required
            defaultValue={initial?.question ?? ""}
          />
        </Field>
        <Field label="Answer">
          <Textarea
            name="answer"
            required
            defaultValue={initial?.answer ?? ""}
            className="min-h-[160px]"
          />
        </Field>
        <Field label="Category">
          <Select name="category" defaultValue={initial?.category ?? ""}>
            <option value="">— none —</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Display order">
          <Input
            name="order"
            type="number"
            inputMode="numeric"
            defaultValue={initial?.order ?? ""}
          />
        </Field>
        <div className="mt-6 flex gap-3">
          <Submit label={mode === "create" ? "Create FAQ" : "Save changes"} />
          <SecondaryLink href="/admin/faqs">Cancel</SecondaryLink>
        </div>
      </form>
    </Card>
  );
}
