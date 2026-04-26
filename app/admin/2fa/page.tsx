import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { verifyOtpAction } from "./actions";
import { OtpForm } from "./OtpForm";

export const metadata: Metadata = {
  title: "Two-factor — Bulldog Security Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();

  // Already fully signed in → just go home (or to next).
  if (session.userId) {
    redirect(params.next ?? "/admin");
  }

  // No pending state (or expired) → re-enter password. Don't try
  // to destroy() the cookie here — Server Components can't mutate
  // cookies in Next.js. The redirect target's login flow will
  // overwrite the cookie on next successful auth, and the pending
  // fields are short-lived (5 min) anyway.
  if (
    !session.pendingUserId ||
    !session.pendingEmail ||
    !session.pendingExpiresAt ||
    session.pendingExpiresAt < Date.now()
  ) {
    redirect("/admin/login");
  }

  return (
    <OtpForm
      action={verifyOtpAction}
      next={params.next ?? "/admin"}
      pendingEmail={session.pendingEmail}
    />
  );
}
