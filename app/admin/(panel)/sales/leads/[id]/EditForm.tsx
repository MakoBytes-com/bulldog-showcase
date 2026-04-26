"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { SalesLead } from "@/lib/db/schema";

import { updateLeadAction, type ActionResult } from "../actions";

const STATUS_OPTIONS: { value: SalesLead["status"]; label: string; sf: string }[] = [
  { value: "new", label: "New", sf: "Open - Not Contacted" },
  { value: "saved", label: "Saved (in pipeline)", sf: "Working - Contacted" },
  { value: "mailed", label: "Mailed", sf: "Working - Contacted" },
  { value: "contacted", label: "Contacted", sf: "Working - Contacted" },
  { value: "quoted", label: "Quoted", sf: "Working - Contacted" },
  { value: "won", label: "Won (closed deal)", sf: "Closed - Converted" },
  { value: "dead", label: "Dead (closed lost)", sf: "Closed - Not Converted" },
];

function formatLocalDateTime(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  // datetime-local needs YYYY-MM-DDTHH:mm
  const off = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - off).toISOString().slice(0, 16);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[#006fb9] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3a94d6] disabled:opacity-40"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function EditForm({ lead }: { lead: SalesLead }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateLeadAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={lead.id} />

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#7a8aa0]">
          Status
        </label>
        <select
          name="status"
          defaultValue={lead.status}
          className="w-full rounded-md border border-[#1d3554] bg-[#0e2b5c] px-3 py-2 text-sm text-white focus:border-[#3a94d6] focus:outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} &middot; SF: {opt.sf}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-[#7a8aa0]">
          Each status maps to a Salesforce Lead Status (shown above) so
          CSV exports drop into SF cleanly.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#7a8aa0]">
          Next action
        </label>
        <input
          type="datetime-local"
          name="next_action_at"
          defaultValue={formatLocalDateTime(lead.nextActionAt)}
          className="w-full rounded-md border border-[#1d3554] bg-[#0e2b5c] px-3 py-2 text-sm text-white focus:border-[#3a94d6] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#7a8aa0]">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={lead.notes ?? ""}
          rows={6}
          placeholder="Call notes, conversation history, quote details…"
          className="w-full rounded-md border border-[#1d3554] bg-[#0e2b5c] px-3 py-2 text-sm text-white placeholder:text-[#7a8aa0] focus:border-[#3a94d6] focus:outline-none"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-[#cfd9e5]">
        <input
          type="checkbox"
          name="internal_do_not_contact"
          defaultChecked={lead.internalDoNotContact}
          className="h-4 w-4 cursor-pointer accent-rose-400"
        />
        <span>
          <strong className="text-rose-300">Internal Do Not Contact</strong>{" "}
          &mdash; mark this lead so no future outreach (call, mail, text) is
          attempted.
        </span>
      </label>

      <div className="flex items-center gap-4 border-t border-[#1d3554] pt-4">
        <SubmitButton />
        {state?.ok ? (
          <span className="text-sm text-emerald-300">✓ Saved</span>
        ) : null}
        {state && !state.ok ? (
          <span className="text-sm text-rose-300">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
