import type { Metadata } from "next";

import { requestPasswordResetAction } from "./actions";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Reset password — Bulldog Security Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ForgotPage() {
  return <ForgotForm action={requestPasswordResetAction} />;
}
