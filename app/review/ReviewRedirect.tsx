"use client";

import { useEffect } from "react";

import { track } from "@/lib/track";

/**
 * Fires the channel-attribution event then bounces to Google.
 *
 * Client-side intentionally — `track()` honors the admin self-exclude
 * flag set by AdminShell, so Russell's own review-page hits don't
 * pollute the channel attribution chart.
 */
export function ReviewRedirect({
  target,
  source,
}: {
  target: string;
  source: string;
}) {
  useEffect(() => {
    track("Review Link Clicked", { source });
    // Tiny delay so the beacon has a chance to flush before navigation.
    const t = setTimeout(() => {
      window.location.replace(target);
    }, 150);
    return () => clearTimeout(t);
  }, [target, source]);

  return null;
}
