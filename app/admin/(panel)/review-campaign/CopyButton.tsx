"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Very old browsers — fall through silently.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-[#1d3554] bg-[#112740] px-3 py-1.5 text-xs font-semibold text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white"
    >
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
      {copied ? "Copied" : label}
    </button>
  );
}
