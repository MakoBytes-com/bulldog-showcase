"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  relativeTime,
  type RecentDeploymentsResult,
  type VercelDeployment,
} from "@/lib/vercel";

const POLL_MS = 30_000;

function stateColor(state: string): { dot: string; label: string; text: string } {
  const s = state.toUpperCase();
  if (s === "READY")
    return { dot: "bg-emerald-400", label: "Ready", text: "text-emerald-300" };
  if (s === "BUILDING" || s === "INITIALIZING" || s === "QUEUED")
    return {
      dot: "bg-sky-400 animate-pulse",
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      text: "text-sky-300",
    };
  if (s === "ERROR")
    return { dot: "bg-red-500", label: "Error", text: "text-red-300" };
  if (s === "CANCELED")
    return { dot: "bg-amber-400", label: "Canceled", text: "text-amber-300" };
  return { dot: "bg-slate-400", label: s, text: "text-slate-300" };
}

export function RecentDeploymentsLive({
  initialResult,
}: {
  initialResult: RecentDeploymentsResult;
}) {
  const [result, setResult] = useState<RecentDeploymentsResult>(initialResult);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [refreshing, setRefreshing] = useState(false);
  // Cheap clock so "Updated 12s ago" stays accurate without re-fetching.
  const [, forceTick] = useState(0);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/deployments", { cache: "no-store" });
      if (res.ok) {
        const fresh = (await res.json()) as RecentDeploymentsResult;
        setResult(fresh);
        setLastUpdated(Date.now());
      }
    } catch {
      // Ignore — keep showing the previous data; "Updated Xs ago" tells
      // Russell we haven't fetched recently, which is enough signal.
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // 1Hz tick so the "Updated Xs ago" label updates without polling.
  useEffect(() => {
    const tick = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  // Refresh on window focus — if Russell switches tabs and comes back,
  // catch up immediately rather than waiting up to 30s for the next tick.
  useEffect(() => {
    function onFocus() {
      void refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <section className="mt-10 rounded-xl border border-[#1d3554] bg-[#112740] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#7a8aa0]">
          Recent Deployments
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span
            className={`text-[#7a8aa0] ${refreshing ? "animate-pulse text-[#3a94d6]" : ""}`}
            aria-live="polite"
          >
            {refreshing ? "Refreshing…" : `Updated ${relativeTime(lastUpdated)}`}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="rounded-md border border-[#1d3554] bg-[#0e2b5c] px-2.5 py-1 text-[#cfd9e5] transition hover:border-[#3a94d6] hover:text-white disabled:opacity-60"
          >
            ↻ Refresh
          </button>
          <a
            href="https://vercel.com/mako-studi/bulldogsecurityservice-com/deployments"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3a94d6] transition hover:text-white"
          >
            View on Vercel ↗
          </a>
        </div>
      </div>

      {!result.ok ? (
        <div className="rounded-md border border-[#1d3554] bg-[#0e2b5c]/60 p-4 text-sm text-[#cfd9e5]">
          <p className="font-medium text-white">Vercel API not connected</p>
          <p className="mt-2 text-xs leading-relaxed text-[#9fb0c7]">
            {result.reason}
          </p>
        </div>
      ) : result.deployments.length === 0 ? (
        <p className="text-sm text-[#9fb0c7]">No production deployments yet.</p>
      ) : (
        <ul className="divide-y divide-[#1d3554]">
          {result.deployments.map((d: VercelDeployment) => {
            const color = stateColor(d.state);
            const inspector =
              d.inspectorUrl ??
              `https://vercel.com/mako-studi/bulldogsecurityservice-com/${d.uid}`;
            return (
              <li key={d.uid} className="py-3">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className={`text-xs font-semibold ${color.text}`}>
                        {color.label}
                      </span>
                      <span className="text-xs text-[#7a8aa0]">
                        {relativeTime(d.createdAt)}
                      </span>
                      {d.commitSha ? (
                        <span className="font-mono text-xs text-[#7a8aa0]">
                          {d.commitSha.slice(0, 7)}
                        </span>
                      ) : null}
                      {d.commitAuthor ? (
                        <span className="text-xs text-[#7a8aa0]">
                          by {d.commitAuthor}
                        </span>
                      ) : null}
                    </div>
                    <a
                      href={inspector}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-sm text-white transition hover:text-[#3a94d6]"
                      title={d.commitMessage ?? ""}
                    >
                      {d.commitMessage ?? "(no commit message)"}
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
