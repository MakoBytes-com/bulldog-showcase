import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { loginAction } from "./actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Bulldog Security Admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  if (session.userId) redirect(params.next ?? "/admin");

  return (
    <LoginForm
      action={loginAction}
      next={params.next ?? "/admin"}
      flashMessage={
        params.reset === "ok"
          ? "Password updated. Sign in with your new password."
          : null
      }
    />
  );
}
