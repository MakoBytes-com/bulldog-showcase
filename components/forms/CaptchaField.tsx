"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

/**
 * The Turnstile widget for the public contact form.
 *
 * WHY THIS EXISTS RATHER THAN `<Turnstile>` INLINE IN THE FORM:
 *
 * A Turnstile token can be redeemed exactly once. The form uses
 * `useActionState`, which re-renders in place when the server returns an error
 * WITHOUT remounting the widget — so the visitor's second attempt re-sends a
 * token Cloudflare has already spent, and it is refused. The widget keeps
 * showing a solved challenge throughout, so they are told to complete
 * something that looks complete, and retrying can never work. Only reloading
 * the page clears it.
 *
 * On a contact form that means a real enquiry typing their details, tripping
 * one validation error, and never getting through — and nothing is recorded as
 * lost, because the submission never arrives.
 *
 * Bumping `key` is what forces Cloudflare to issue a new token; it is the
 * React-sanctioned way of saying "this is a different widget now". The admin
 * login, forgot-password and 2FA forms on this site already had this fix; the
 * public form never did.
 */
export function CaptchaField({
  siteKey,
  /** Pass the form's `useActionState` state. Each server reply mints a token. */
  resetOn,
  theme = "light",
}: {
  siteKey?: string;
  resetOn?: unknown;
  theme?: "light" | "dark";
}) {
  // Derived during render rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect
  const [epoch, setEpoch] = useState(0);
  const [prevReset, setPrevReset] = useState(resetOn);
  if (resetOn !== prevReset) {
    setPrevReset(resetOn);
    setEpoch((n) => n + 1);
  }

  // No site key means the server treats the captcha as dormant, so rendering
  // nothing matches it — a missing env var must never block the form.
  if (!siteKey) return null;

  return (
    <Turnstile
      key={epoch}
      siteKey={siteKey}
      options={{ theme, size: "flexible" }}
    />
  );
}
