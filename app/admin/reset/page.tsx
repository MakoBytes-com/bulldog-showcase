import type { Metadata } from "next";
import Link from "next/link";

import { findUserByResetToken } from "@/lib/auth/passwordReset";
import { consumeResetTokenAction } from "./actions";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Reset password — Bulldog Security Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function InvalidLink() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e2b5c] to-[#0b1a2e] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="mb-10 flex flex-col items-center gap-3">
          <span className="font-display text-3xl font-semibold text-white">
            Bulldog
          </span>
        </div>
        <div className="w-full rounded-xl border border-[#1d3554] bg-[#112740] p-8 shadow-xl">
          <h2 className="mb-3 text-lg font-semibold text-white">
            This reset link won&rsquo;t work
          </h2>
          <p className="text-sm text-[#cfd9e5]">
            Reset links expire after 1 hour and can only be used once. Request
            a fresh one and try again.
          </p>
          <p className="mt-6 text-sm">
            <Link
              href="/admin/forgot"
              className="text-[#3a94d6] hover:text-white"
            >
              Request a new reset link →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) return <InvalidLink />;
  const user = await findUserByResetToken(token);
  if (!user || user.disabledAt) return <InvalidLink />;

  return (
    <ResetForm
      action={consumeResetTokenAction}
      token={token}
      email={user.email}
    />
  );
}
