"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// NOTE: Do NOT import "@/lib/log" here. This is a client component, and
// logError() transitively imports lib/db (Drizzle + Neon connection),
// which throws "DATABASE_URI env var is not set" the moment the chunk
// loads in the browser. Use console.error directly instead — these are
// turnstile diagnostics from the user's browser anyway.
function logError(scope: string, message: string, err?: unknown) {
  console.error(`[${scope}] ${message}`, err);
}

// @marsidev/react-turnstile already declares `getTurnstile()` globally;
// we just narrow to the calls we use here via a local type alias.
type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      appearance?: "always" | "execute" | "interaction-only";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: (code?: string) => void;
      "timeout-callback"?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
};
function getTurnstile(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const RENDER_TIMEOUT_MS = 12_000;

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

type WidgetState = "loading" | "ready" | "error";

export default function Turnstile({ onToken, onExpire }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const mountRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [state, setState] = useState<WidgetState>("loading");
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState("loading");
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!siteKey || !mountRef.current) return;

    let cancelled = false;
    const el = mountRef.current;
    el.innerHTML = "";

    const timeout = setTimeout(() => {
      if (cancelled) return;
      setState((s) => (s === "ready" ? s : "error"));
    }, RENDER_TIMEOUT_MS);

    function ensureScript(): Promise<void> {
      if (getTurnstile()) return Promise.resolve();
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`
      );
      if (existing) {
        return new Promise((resolve, reject) => {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error("script error")),
            { once: true }
          );
        });
      }
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
      return new Promise((resolve, reject) => {
        s.addEventListener("load", () => resolve(), { once: true });
        s.addEventListener(
          "error",
          () => reject(new Error("script load failed")),
          { once: true }
        );
      });
    }

    ensureScript()
      .then(() => {
        const ts = getTurnstile();
        if (cancelled || !mountRef.current || !ts) return;
        try {
          widgetIdRef.current = ts.render(mountRef.current, {
            sitekey: siteKey!,
            theme: "dark",
            appearance: "always",
            callback: (token) => {
              clearTimeout(timeout);
              setState("ready");
              onToken(token);
            },
            "expired-callback": () => {
              onExpire?.();
            },
            "error-callback": (code) => {
              clearTimeout(timeout);
              setState("error");
              onExpire?.();
              logError("turnstile", "error-callback", code);
            },
          });
          setState("ready");
        } catch (err) {
          clearTimeout(timeout);
          setState("error");
          logError("turnstile", "render threw", err);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        clearTimeout(timeout);
        setState("error");
        logError("turnstile", "script load failed", err);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      const ts = getTurnstile();
      if (widgetIdRef.current && ts) {
        try {
          ts.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onToken, onExpire, attempt]);

  if (!siteKey) return null;

  return (
    <div className="min-h-[70px]">
      {state === "loading" && (
        <div className="flex items-center gap-2 text-xs text-mako-text-muted">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-mako-border border-t-mako-blue-soft" />
          Loading verification…
        </div>
      )}
      {state === "error" && (
        <div className="space-y-1 text-xs text-amber-300/90">
          <div>
            Couldn&rsquo;t load the bot-check. An extension or strict privacy
            setting may be blocking
            <span className="opacity-70"> challenges.cloudflare.com</span>.
          </div>
          <button
            type="button"
            onClick={retry}
            className="text-amber-200 underline hover:no-underline"
          >
            Try again
          </button>
          <span className="opacity-70"> · or email </span>
          <a
            href="mailto:info@bdsnation.com"
            className="text-amber-200 underline hover:no-underline"
          >
            info@bdsnation.com
          </a>
        </div>
      )}
      <div ref={mountRef} className="cf-turnstile-mount" />
    </div>
  );
}
