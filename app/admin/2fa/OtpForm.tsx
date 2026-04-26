"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import Turnstile from "@/components/Turnstile";

type ActionResult = { error: string | null };
type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

function SubmitButton({ label, disabled }: { label: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="mt-2 w-full rounded-md bg-[#006fb9] px-5 py-3 text-lg font-semibold text-white transition hover:bg-[#3a94d6] disabled:opacity-60"
    >
      {pending ? "Verifying…" : label}
    </button>
  );
}

export function OtpForm({
  action,
  next,
  pendingEmail,
}: {
  action: Action;
  next: string;
  pendingEmail: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, {
    error: null,
  });
  const [useRecovery, setUseRecovery] = useState(false);
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
            Two-factor verification
          </p>
        </div>

        <form
          action={formAction}
          className="w-full rounded-xl border border-[#1d3554] bg-[#112740] p-8 shadow-xl"
        >
          <input type="hidden" name="next" value={next} />
          <input
            type="hidden"
            name="use_recovery"
            value={useRecovery ? "1" : ""}
          />

          <p className="mb-5 text-sm text-[#cfd9e5]">
            Signing in as <span className="font-medium text-white">{pendingEmail}</span>.
            {useRecovery ? (
              <> Enter one of your saved recovery codes.</>
            ) : (
              <> Enter the 6-digit code from your authenticator app.</>
            )}
          </p>

          <label
            htmlFor="code"
            className="mb-2 block text-sm font-medium text-[#cfd9e5]"
          >
            {useRecovery ? "Recovery code" : "Authentication code"}
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            inputMode={useRecovery ? "text" : "numeric"}
            autoComplete="one-time-code"
            autoFocus
            pattern={useRecovery ? "[A-Za-z0-9-]{11}" : "[0-9]{6}"}
            placeholder={useRecovery ? "xxxxx-xxxxx" : "123 456"}
            className="mb-4 block w-full rounded-md border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-center text-2xl tracking-[0.4em] text-white outline-none placeholder:text-[#7a8aa0] focus:border-[#006fb9]"
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

          <SubmitButton label="Verify" disabled={!captchaReady} />

          <div className="mt-5 text-xs">
            <button
              type="button"
              onClick={() => setUseRecovery((v) => !v)}
              className="text-[#3a94d6] hover:text-white"
            >
              {useRecovery
                ? "Use authenticator app instead"
                : "Use a recovery code"}
            </button>
          </div>
        </form>

        <form action="/admin/2fa/cancel" method="post" className="mt-3">
          <button
            type="submit"
            className="w-full text-center text-xs text-[#7a8aa0] hover:text-white"
          >
            Cancel and return to sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-[#7a8aa0]">
          Lost your device and recovery codes? Another admin can reset your
          2FA from the Users page.
        </p>
      </div>
    </div>
  );
}
