"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import Turnstile from "@/components/Turnstile";

type ActionResult = { error: string | null; sent: boolean };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-2 w-full rounded-md bg-[#006fb9] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#3a94d6] disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export function ForgotForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    error: null,
    sent: false,
  });
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaEpoch, setCaptchaEpoch] = useState(0);

  const handleToken = useCallback((t: string) => setCaptchaToken(t), []);
  const handleExpire = useCallback(() => setCaptchaToken(""), []);

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
            Reset password
          </p>
        </div>

        {state.sent ? (
          <div className="w-full rounded-xl border border-[#1d3554] bg-[#112740] p-8 shadow-xl">
            <h2 className="mb-3 text-lg font-semibold text-white">Check your email</h2>
            <p className="text-sm text-[#cfd9e5]">
              If an account exists for that email, we&rsquo;ve sent a reset
              link. The link expires in 1 hour. Check your spam folder if you
              don&rsquo;t see it within a couple of minutes.
            </p>
            <p className="mt-6 text-sm">
              <Link
                href="/admin/login"
                className="text-[#3a94d6] hover:text-white"
              >
                ← Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <form
            action={formAction}
            className="w-full rounded-xl border border-[#1d3554] bg-[#112740] p-8 shadow-xl"
          >
            <p className="mb-5 text-sm text-[#cfd9e5]">
              Enter the email on your account. We&rsquo;ll send you a link to
              choose a new password.
            </p>

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

            {state.error ? (
              <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {state.error}
              </div>
            ) : null}

            <Submit disabled={!captchaReady} />

            <p className="mt-5 text-center text-sm">
              <Link
                href="/admin/login"
                className="text-[#3a94d6] hover:text-white"
              >
                ← Back to sign in
              </Link>
            </p>
          </form>
        )}

        <p className="mt-6 text-xs text-[#7a8aa0]">
          Lost your 2FA device too? Another admin can reset 2FA from the
          Users page after you sign in.
        </p>
      </div>
    </div>
  );
}
