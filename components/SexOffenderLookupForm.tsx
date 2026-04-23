"use client";

import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";

// Opens the official state sex offender registry in a new tab on submit.
// Nothing is sent to our server — the user's ZIP is only used as a hint they
// can paste into the official registry's own search form.
type Props = {
  /** The state the page is for — selects which registry opens. */
  state: "TX" | "FL" | string;
  /** City pre-filled in the ZIP hint label. */
  city: string;
};

const REGISTRIES: Record<string, { label: string; url: string }> = {
  TX: {
    label: "Texas DPS Public Sex Offender Registry",
    url: "https://publicsite.dps.texas.gov/SexOffenderRegistry/",
  },
  FL: {
    label: "FDLE Florida Sex Offender Registry",
    url: "https://offender.fdle.state.fl.us/offender/sops/home.jsf",
  },
  US: {
    label: "National Sex Offender Public Website (NSOPW)",
    url: "https://www.nsopw.gov/",
  },
};

export function SexOffenderLookupForm({ state, city }: Props) {
  const [zip, setZip] = useState("");
  const registry = REGISTRIES[state] ?? REGISTRIES.US;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Open the official state registry in a new tab. We can't deep-link the
    // address because state registries use POST forms with CSRF protection.
    window.open(registry.url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Your ZIP in {city}
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{5}"
          maxLength={5}
          placeholder="ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-brand-800 transition-colors"
      >
        <Search className="h-4 w-4" />
        Check the registry
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
