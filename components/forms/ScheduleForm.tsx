"use client";

import { useActionState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { submitForm, INITIAL_STATE } from "@/app/actions/submit-form";
import { SCHEDULE_CONSENT } from "@/lib/site";
import { Honeypot } from "./Honeypot";
import { ConsentBlockLight } from "./ConsentBlock";

type Props = { turnstileSiteKey?: string };

/** /schedule/ "Schedule A Service" form. */
export function ScheduleForm({ turnstileSiteKey }: Props) {
  const [state, formAction, pending] = useActionState(submitForm, INITIAL_STATE);

  if (state.status === "success") {
    return (
      <div className="rounded-lg bg-brand-50 p-8 text-center border border-brand-200">
        <div className="section-label text-xs">Thank you</div>
        <h3 className="mt-3 font-display text-2xl text-ink">{state.message}</h3>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="formType" value="schedule" />
      <Honeypot />

      <Field label="Full Name" name="name" required autoComplete="name" />
      <Field label="Phone Number" name="phone" type="tel" required autoComplete="tel" />
      <Field label="Account Number" name="accountNumber" hint="Optional — if you're an existing customer." />
      <Field label="Preferred Service Date" name="preferredDate" type="date" />
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink">Notes</label>
        <textarea
          name="notes"
          rows={4}
          className="mt-1.5 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
      </div>

      {turnstileSiteKey && (
        <Turnstile siteKey={turnstileSiteKey} options={{ theme: "light", size: "flexible" }} />
      )}

      {state.status === "error" && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.message}
        </p>
      )}

      <ConsentBlockLight text={SCHEDULE_CONSENT} />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-sm uppercase tracking-wider text-sm transition-colors"
      >
        {pending ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-1.5 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
