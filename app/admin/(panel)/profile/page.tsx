import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import {
  buildOtpAuthUrl,
  buildQrDataUrl,
  generateTotpSecret,
  remainingRecoveryCodeCount,
} from "@/lib/auth/totp";
import { PageHeader, Pill } from "../../_components/ui";
import { PasswordSection } from "./PasswordSection";
import { EnrollTotpSection } from "./EnrollTotpSection";
import { DisableTotpSection } from "./DisableTotpSection";
import { RegenerateCodesSection } from "./RegenerateCodesSection";

export const metadata = { title: "My account" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");
  const user = await findUserById(session.userId);
  if (!user) redirect("/admin/login");

  const totpEnrolled = Boolean(user.totpEnrolledAt && user.totpSecret);

  // If not enrolled, mint a fresh secret for the setup UI. Only
  // persisted to the DB after the user enters the first valid OTP.
  let enrollmentSecret = "";
  let qrDataUrl = "";
  let otpAuthUrl = "";
  if (!totpEnrolled) {
    enrollmentSecret = generateTotpSecret();
    qrDataUrl = await buildQrDataUrl(user.email, enrollmentSecret);
    otpAuthUrl = buildOtpAuthUrl(user.email, enrollmentSecret);
  }

  const remaining = totpEnrolled
    ? await remainingRecoveryCodeCount(user.id)
    : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="My account"
        subtitle={`${user.email} · ${user.role}`}
      />

      <div className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7a8aa0]">
          Password
        </h2>
        <PasswordSection />
      </div>

      <div className="mb-10">
        <h2 className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-[#7a8aa0]">
          Two-factor authentication
          {totpEnrolled ? (
            <Pill tone="success">Enabled</Pill>
          ) : (
            <Pill tone="warn">Not enabled</Pill>
          )}
        </h2>

        {totpEnrolled ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#1d3554] bg-[#112740] p-6 text-sm text-[#cfd9e5]">
              <p>
                You enabled 2FA on{" "}
                <span className="text-white">
                  {new Date(user.totpEnrolledAt as Date).toLocaleString()}
                </span>
                .
              </p>
              <p className="mt-2">
                You have <span className="text-white">{remaining}</span> unused
                recovery {remaining === 1 ? "code" : "codes"}. If you lose
                your device, any recovery code gets you back in.
              </p>
              {remaining === 0 ? (
                <p className="mt-3 text-amber-200">
                  ⚠ No recovery codes left. Generate new ones below before
                  anything happens to your device.
                </p>
              ) : null}
            </div>

            <RegenerateCodesSection />
            <DisableTotpSection />
          </div>
        ) : (
          <EnrollTotpSection
            email={user.email}
            secret={enrollmentSecret}
            qrDataUrl={qrDataUrl}
            otpAuthUrl={otpAuthUrl}
          />
        )}
      </div>
    </div>
  );
}
