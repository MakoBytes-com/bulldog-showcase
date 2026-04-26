"use client";

import { useState } from "react";

import { DangerButton, SecondaryButton } from "../../_components/ui";
import { toggleDisabledAction } from "./actions";

export function ToggleDisabledButton({
  id,
  currentlyDisabled,
}: {
  id: number;
  currentlyDisabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const label = currentlyDisabled ? "Re-enable" : "Disable";

  async function submit() {
    if (!confirm(`${label} this user?`)) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("id", String(id));
    fd.set("disable", currentlyDisabled ? "false" : "true");
    try {
      await toggleDisabledAction(fd);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const Button = currentlyDisabled ? SecondaryButton : DangerButton;
  return (
    <Button type="button" onClick={submit} disabled={busy}>
      {label}
    </Button>
  );
}
