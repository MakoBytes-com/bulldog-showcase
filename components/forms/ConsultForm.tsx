"use client";

import { useActionState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { submitForm, INITIAL_STATE } from "@/app/actions/submit-form";
import { CONSULT_CONSENT } from "@/lib/site";
import { Honeypot } from "./Honeypot";
import { ConsentBlock } from "./ConsentBlock";

type Props = { turnstileSiteKey?: string };

/**
 * "Book a Virtual Consult" — mirrors the live Gravity Form that appears
 * on Home, Solutions, Automation, and About Us pages.
 * Renders inside a dark/image-backed card so uses white text.
 */
export function ConsultForm({ turnstileSiteKey }: Props) {
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
    <form action={formAction} className="space-y-4 text-white">
      <input type="hidden" name="formType" value="consult" />
      <Honeypot />

      <DarkField label="Full Name" name="name" required autoComplete="name" />
      <DarkField label="Phone Number" name="phone" type="tel" required autoComplete="tel" />
      <DarkField label="ZIP Code" name="zip" autoComplete="postal-code" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DarkField label="Preferred Date" name="preferredDate" type="date" />
        <DarkField label="Preferred Time" name="preferredTime" type="time" />
      </div>

      {turnstileSiteKey && (
        <Turnstile siteKey={turnstileSiteKey} options={{ theme: "dark", size: "flexible" }} />
      )}

      {state.status === "error" && (
        <p className="text-sm text-white bg-red-700/70 border border-red-500/50 rounded-md px-3 py-2">
          {state.message}
        </p>
      )}

      <ConsentBlock text={CONSULT_CONSENT} />

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 bg-success hover:bg-success/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-sm uppercase tracking-wider text-sm transition-colors"
      >
        {pending ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

function DarkField({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-white/90">
        {label} {required && <span className="text-red-300">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-1.5 block w-full rounded-md border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/50 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/40"
      />
    </div>
  );
}
