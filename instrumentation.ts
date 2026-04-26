import type { Instrumentation } from "next";

/**
 * Bridges Next.js's unhandled-error path into our /admin/errors dashboard.
 *
 * Without this, server-rendering errors (React serialization failures,
 * thrown errors in Server Components, etc.) only end up in Vercel's
 * runtime logs — they never reach the error_events table that
 * /admin/errors reads from.
 *
 * Edge-runtime errors are skipped because lib/log uses node:crypto +
 * neon-http with options that aren't all edge-safe; we'd rather drop
 * those rare edge errors than risk crashing the instrumentation hook
 * itself.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { logError } = await import("@/lib/log");
  const e = err as Error & { digest?: string };

  logError("next/onRequestError", e.message || "unhandled server error", {
    name: e.name,
    digest: e.digest,
    stack: e.stack,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    routerKind: context.routerKind,
  });
};
