"use client";

import { useEffect } from "react";

/**
 * Sets the `mako_no_track=1` localStorage flag the first time an
 * authenticated admin loads /admin in a given browser. After that, the
 * tracker in src/lib/track.ts short-circuits so Mako Admin's own page
 * views and conversion clicks never hit the analytics DB. Works across
 * IP changes, VPNs, mobile hotspots — as long as he's logged into the
 * same browser profile at least once.
 *
 * Clearing `localStorage.removeItem("mako_no_track")` re-enables
 * tracking if he ever wants to test the tracker from his own browser.
 */
export default function AdminSelfExclude() {
  useEffect(() => {
    try {
      if (localStorage.getItem("mako_no_track") !== "1") {
        localStorage.setItem("mako_no_track", "1");
      }
    } catch {
      // Private browsing or disabled storage — no-op. Worst case his
      // own page views count as real traffic; not a correctness bug.
    }
  }, []);
  return null;
}
