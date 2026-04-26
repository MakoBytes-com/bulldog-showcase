"use client";

import { useState } from "react";

import { DangerButton } from "../../_components/ui";
import { resetUserTotpAction } from "./actions";

export function Reset2faButton({ userId }: { userId: number }) {
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (
      !confirm(
        "Reset this user's 2FA? They'll sign in with their password next time and will need to re-enroll.",
      )
    )
      return;
    setBusy(true);
    const fd = new FormData();
    fd.set("id", String(userId));
    try {
      await resetUserTotpAction(fd);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DangerButton type="button" onClick={submit} disabled={busy}>
      {busy ? "Resetting…" : "Reset 2FA"}
    </DangerButton>
  );
}
