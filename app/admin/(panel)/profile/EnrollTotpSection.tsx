"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  Alert,
  Card,
  Field,
  Input,
  PrimaryButton,
  SecondaryButton,
} from "../../_components/ui";
import { enrollTotpAction, type EnrollmentResult } from "./actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <PrimaryButton type="submit" disabled={pending}>
      {pending ? "Verifying…" : label}
    </PrimaryButton>
  );
}

export function EnrollTotpSection({
  email,
  secret,
  qrDataUrl,
  otpAuthUrl,
}: {
  email: string;
  secret: string;
  qrDataUrl: string;
  otpAuthUrl: string;
}) {
  const [state, formAction] = useActionState<EnrollmentResult, FormData>(
    enrollTotpAction,
    { error: null },
  );
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyManual = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort
    }
  };

  if (state.recoveryCodes) {
    return (
      <Card className="p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">
          2FA enabled — save your recovery codes
        </h3>
        <Alert tone="warn">
          These codes let you sign in if you lose your phone. Each works once.{" "}
          <strong>We won&rsquo;t show them again.</strong> Copy them somewhere
          safe (password manager, printed and put in a drawer — your call).
        </Alert>
        <pre className="my-4 grid grid-cols-2 gap-x-8 gap-y-1 rounded-md border border-[#1d3554] bg-[#0b1a2e] p-5 text-center font-mono text-base tracking-wider text-white">
          {state.recoveryCodes.map((c) => (
            <code key={c}>{c}</code>
          ))}
        </pre>
        <div className="flex flex-wrap gap-3">
          <SecondaryButton
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                state.recoveryCodes!.join("\n"),
              );
            }}
          >
            Copy all codes
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => window.location.reload()}
          >
            I&rsquo;ve saved them — continue
          </PrimaryButton>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <div className="flex justify-center rounded-lg bg-[#0b1a2e] p-3">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="TOTP setup QR code"
              className="h-[260px] w-[260px] rounded"
            />
          ) : null}
        </div>

        <div className="text-sm text-[#cfd9e5]">
          <p className="font-medium text-white">Step 1 — scan the QR code</p>
          <p className="mt-1">
            Open Google Authenticator / 1Password / Authy (or any TOTP app),
            tap &ldquo;Add&rdquo;, and scan the code to the left. The app
            will save it as{" "}
            <span className="text-white">Bulldog Security Admin ({email})</span>.
          </p>

          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="mt-3 text-xs text-[#3a94d6] underline hover:text-white"
          >
            Can&rsquo;t scan? Enter manually
          </button>

          {showManual ? (
            <div className="mt-3 rounded-md border border-[#1d3554] bg-[#0b1a2e] p-3">
              <div className="mb-1 text-xs uppercase tracking-wider text-[#7a8aa0]">
                Secret (base32)
              </div>
              <code className="block break-all font-mono text-sm text-white">
                {secret}
              </code>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={copyManual}
                  className="rounded-md border border-[#1d3554] px-2 py-1 text-[#cfd9e5] hover:border-[#3a94d6] hover:text-white"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                <a
                  href={otpAuthUrl}
                  className="text-[#3a94d6] hover:text-white"
                >
                  Open in authenticator app
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 border-t border-[#1d3554] pt-6">
        <form action={formAction}>
          <input type="hidden" name="secret" value={secret} />

          <p className="mb-4 text-sm font-medium text-white">
            Step 2 — confirm with your password + first code
          </p>

          <Field label="Current password">
            <Input
              name="current_password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          <Field
            label="6-digit code from your authenticator"
            hint="If the code keeps failing, double-check your phone's clock is on auto."
          >
            <Input
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              required
              placeholder="123456"
              className="tracking-[0.4em] text-center text-xl"
            />
          </Field>

          <Submit label="Enable 2FA" />
        </form>
      </div>
    </Card>
  );
}
