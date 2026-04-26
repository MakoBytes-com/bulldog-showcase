import { notFound, redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { Card, PageHeader, Pill } from "../../../_components/ui";
import { updateUserAction } from "../actions";
import { UserForm } from "../UserForm";
import { Reset2faButton } from "../Reset2faButton";

export const metadata = { title: "Edit user" };

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session.role !== "admin") redirect("/admin");

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) notFound();

  const user = await findUserById(id);
  if (!user) notFound();

  const totpEnrolled = Boolean(user.totpEnrolledAt && user.totpSecret);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={`Edit: ${user.name}`} subtitle={user.email} />

      <UserForm
        action={updateUserAction}
        mode="edit"
        initial={{
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "admin" | "editor",
        }}
      />

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7a8aa0]">
          Two-factor authentication
        </h2>
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            {totpEnrolled ? (
              <Pill tone="success">Enabled</Pill>
            ) : (
              <Pill tone="warn">Not enabled</Pill>
            )}
            {totpEnrolled && user.totpEnrolledAt ? (
              <span className="text-xs text-[#7a8aa0]">
                since {new Date(user.totpEnrolledAt).toLocaleDateString()}
              </span>
            ) : null}
          </div>

          {totpEnrolled ? (
            <>
              <p className="mb-4 text-sm text-[#cfd9e5]">
                Use this if this user lost their device AND their recovery
                codes. It removes their 2FA secret and all recovery codes.
                They&rsquo;ll sign in with password only next time, then should
                re-enroll from <span className="text-white">My account</span>.
              </p>
              <Reset2faButton userId={user.id} />
            </>
          ) : (
            <p className="text-sm text-[#cfd9e5]">
              This user hasn&rsquo;t enrolled in 2FA yet. Admins can&rsquo;t
              enroll them remotely — ask the user to set it up themselves from
              the My account page after signing in.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
