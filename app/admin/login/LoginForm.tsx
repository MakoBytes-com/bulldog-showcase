"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import Turnstile from "@/components/Turnstile";

type ActionResult = { error: string | null };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="mt-2 w-full rounded-md bg-[#006fb9] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#3a94d6] disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({
  action,
  next,
  flashMessage,
}: {
  action: Action;
  next: string;
  flashMessage?: string | null;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    error: null,
  });
  const [captchaToken, setCaptchaToken] = useState<string>("");
  // Turnstile tokens are single-use. After every submit (success or
  // failure) we bump this counter — it's used as the widget's `key`
  // so React remounts it, which forces Cloudflare to hand us a
  // fresh token for the next attempt.
  const [captchaEpoch, setCaptchaEpoch] = useState(0);

  // Stable callback identities — a new function reference every render
  // makes Turnstile's useEffect think the handler changed and
  // remounts the widget in a loop (visible as flashing).
  const handleToken = useCallback((t: string) => setCaptchaToken(t), []);
  const handleExpire = useCallback(() => setCaptchaToken(""), []);

  // Whenever the server sends back an error, the token we submitted
  // is now consumed by Cloudflare. Drop the local token and remount
  // the widget so the user can solve a new challenge.
  useEffect(() => {
    if (state.error) {
      setCaptchaToken("");
      setCaptchaEpoch((n) => n + 1);
    }
  }, [state.error]);

  const captchaRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const captchaReady = !captchaRequired || captchaToken.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e2b5c] to-[#0b1a2e] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="mb-10 flex flex-col items-center gap-3">
          <span className="font-display text-3xl font-semibold text-white">
            Bulldog
          </span>
          <p className="text-sm uppercase tracking-[0.2em] text-[#cfd9e5]">
            Security Admin
          </p>
        </div>

        <form
          action={formAction}
          className="w-full rounded-xl border border-[#1d3554] bg-[#112740] p-8 shadow-xl"
        >
          <input type="hidden" name="next" value={next} />

          {/*
            Honeypot. Real browsers never touch this; bots crawling form
            fields typically fill every input. Hidden both visually and
            from assistive tech, with autocomplete disabled so password
            managers don't autofill it.
          */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-10000px",
              top: "auto",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          >
            <label>
              Company website
              <input
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[#cfd9e5]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mb-5 block w-full rounded-md border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-base text-white outline-none placeholder:text-[#7a8aa0] focus:border-[#006fb9]"
            placeholder="you@bulldogsecurityservice.com"
          />

          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#cfd9e5]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mb-4 block w-full rounded-md border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-base text-white outline-none placeholder:text-[#7a8aa0] focus:border-[#006fb9]"
          />

          {captchaRequired ? (
            <>
              <input
                type="hidden"
                name="cf-turnstile-response"
                value={captchaToken}
              />
              <div className="mb-4">
                <Turnstile
                  key={captchaEpoch}
                  onToken={handleToken}
                  onExpire={handleExpire}
                />
              </div>
            </>
          ) : null}

          {flashMessage && !state.error ? (
            <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {flashMessage}
            </div>
          ) : null}

          {state.error ? (
            <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </div>
          ) : null}

          <SubmitButton disabled={!captchaReady} />

          {!captchaReady && captchaRequired ? (
            <p className="mt-3 text-center text-xs text-[#7a8aa0]">
              Complete the verification above to enable sign-in.
            </p>
          ) : null}

          <p className="mt-5 text-center text-sm">
            <Link
              href="/admin/forgot"
              className="text-[#3a94d6] hover:text-white"
            >
              Forgot password?
            </Link>
          </p>
        </form>

        <p className="mt-6 text-xs text-[#7a8aa0]">
          Authorized personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
