import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { AdminShell } from "../_components/AdminShell";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");

  // Re-check DB on every request: if the user was disabled mid-session,
  // they should be bounced immediately. We can't session.destroy()
  // here — Server Components can't mutate cookies in Next.js. The
  // login page is the only thing the cookie gets them to anyway,
  // and a re-login overwrites the stale cookie.
  const user = await findUserById(session.userId);
  if (!user || user.disabledAt) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as "admin" | "editor",
      }}
    >
      {children}
    </AdminShell>
  );
}
