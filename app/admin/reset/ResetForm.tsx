"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type ActionResult = { error: string | null; ok: boolean };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-md bg-[#006fb9] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#3a94d6] disabled:opacity-60"
    >
      {pending ? "Saving…" : "Set new password"}
    </button>
  );
}

export function ResetForm({
  action,
  token,
  email,
}: {
  action: Action;
  token: string;
  email: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    error: null,
    ok: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e2b5c] to-[#0b1a2e] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="mb-10 flex flex-col items-center gap-3">
          <span className="font-display text-3xl font-semibold text-white">
            Bulldog
          </span>
          <p className="text-sm uppercase tracking-[0.2em] text-[#cfd9e5]">
            Set a new password
          </p>
        </div>

        <form
          action={formAction}
          className="w-full rounded-xl border border-[#1d3554] bg-[#112740] p-8 shadow-xl"
        >
          <input type="hidden" name="token" value={token} />

          <p className="mb-5 text-sm text-[#cfd9e5]">
            For account{" "}
            <span className="font-medium text-white">{email}</span>. Pick
            something you&rsquo;ll remember — at least 10 characters.
          </p>

          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#cfd9e5]"
          >
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className="mb-5 block w-full rounded-md border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-base text-white outline-none placeholder:text-[#7a8aa0] focus:border-[#006fb9]"
          />

          <label
            htmlFor="confirm"
            className="mb-2 block text-sm font-medium text-[#cfd9e5]"
          >
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="mb-4 block w-full rounded-md border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-base text-white outline-none placeholder:text-[#7a8aa0] focus:border-[#006fb9]"
          />

          {state.error ? (
            <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </div>
          ) : null}

          <Submit />

          <p className="mt-5 text-center text-sm">
            <Link
              href="/admin/login"
              className="text-[#3a94d6] hover:text-white"
            >
              ← Back to sign in
            </Link>
          </p>
        </form>

        <p className="mt-6 text-xs text-[#7a8aa0]">
          If you have 2FA enabled, you&rsquo;ll still need your authenticator
          code to sign in after resetting.
        </p>
      </div>
    </div>
  );
}
