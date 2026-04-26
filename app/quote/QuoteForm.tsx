"use client";

import { useActionState, useEffect, useState } from "react";

import {
  INITIAL_QUOTE_STATE,
  submitQuoteAction,
  type QuoteFormState,
} from "./actions";

type Props = { initialBatchCode?: string };

export function QuoteForm({ initialBatchCode = "" }: Props) {
  const [batchCode, setBatchCode] = useState(initialBatchCode);
  const [state, formAction, pending] = useActionState<QuoteFormState, FormData>(
    submitQuoteAction,
    INITIAL_QUOTE_STATE,
  );

  // If the user lands on /quote?b=<code>, lock the code into the form
  // so it submits with the response. Stays in a hidden input so the
  // user doesn't need to see or touch it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const b = params.get("b");
    if (b && /^[a-z0-9-]{4,32}$/i.test(b)) {
      setBatchCode(b.toLowerCase());
    }
  }, []);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Request received
        </div>
        <h3 className="mt-3 font-display text-2xl text-ink">{state.message}</h3>
        <p className="mt-3 text-sm text-muted">
          Prefer to talk now? Call{" "}
          <a
            href="tel:+18325850725"
            className="font-semibold text-brand-700 hover:text-brand-800"
          >
            (832) 585-0725
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="batch_code" value={batchCode} />
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required autoComplete="name" />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          help="So we can call back with your quote."
        />
      </div>

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        help="Optional if you provided a phone number."
      />

      <Field
        label="Property address"
        name="address"
        autoComplete="street-address"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="City" name="city" autoComplete="address-level2" />
        <Field
          label="State"
          name="state"
          maxLength={2}
          autoComplete="address-level1"
          placeholder="TX"
        />
        <Field
          label="ZIP"
          name="zip"
          maxLength={10}
          autoComplete="postal-code"
        />
      </div>

      <Field
        label="Current security provider"
        name="current_provider"
        help="Optional — we'll match the rate of any active competitor contract."
      />

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink">
          Anything else we should know?
        </label>
        <textarea
          name="message"
          rows={4}
          className="mt-1.5 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          placeholder="Doors, windows, garage, smart-home features…"
        />
      </div>

      {state.status === "error" && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <p className="text-xs text-muted">
        By submitting this form, you agree that Bulldog Security Service may
        contact you at the phone number or email above regarding your quote
        request. We don&rsquo;t share your information.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Get my free quote"}
      </button>

      {batchCode ? (
        <p className="text-[11px] text-muted">
          Reference: <span className="font-mono">{batchCode}</span>
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  help,
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  help?: string;
  maxLength?: number;
  placeholder?: string;
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
        maxLength={maxLength}
        placeholder={placeholder}
        className="mt-1.5 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
      />
      {help ? <p className="mt-1 text-[11px] text-muted">{help}</p> : null}
    </div>
  );
}
