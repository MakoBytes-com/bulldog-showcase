/**
 * Minimal structured-log helper. Every module that used to call
 * `console.error("[module] ...")` now calls `logError("module", ...)`
 * so the format is consistent.
 *
 * As of 2026-04-25, every call also fire-and-forgets a row into the
 * `error_events` Neon table so the new /admin/errors dashboard can
 * group + display server-side errors. The DB write is best-effort:
 * if it fails (DB unreachable, etc.) the original console output
 * still happens — the logger never throws.
 */

import "server-only";

import crypto from "node:crypto";
import { db, schema } from "@/lib/db";

type LogContext = Record<string, unknown> | Error | unknown;

function format(level: string, moduleName: string, message: string): string {
  return `[${moduleName}] ${message}`;
}

function fingerprintFor(moduleName: string, message: string): string {
  // Group identical (module, message) pairs into one row in the
  // dashboard. Truncate the message before hashing so minor
  // length-only variations don't fragment groups.
  const truncated = message.slice(0, 200);
  return crypto
    .createHash("sha256")
    .update(`${moduleName}::${truncated}`)
    .digest("hex");
}

function extractContext(context: LogContext | undefined): {
  stack: string | null;
  extra: Record<string, unknown> | null;
} {
  if (context === undefined) return { stack: null, extra: null };
  if (context instanceof Error) {
    return {
      stack: context.stack ?? null,
      extra: {
        errorName: context.name,
        errorMessage: context.message,
      },
    };
  }
  if (context && typeof context === "object") {
    // Guard against accidental Error subclasses with own props
    const maybeStack = (context as { stack?: unknown }).stack;
    const stack =
      typeof maybeStack === "string" ? maybeStack : null;
    return {
      stack,
      extra: context as Record<string, unknown>,
    };
  }
  return { stack: null, extra: { value: String(context) } };
}

async function persistError(
  level: "error" | "warn",
  moduleName: string,
  message: string,
  context?: LogContext,
): Promise<void> {
  try {
    const { stack, extra } = extractContext(context);
    await db.insert(schema.errorEvents).values({
      level,
      module: moduleName,
      message: message.slice(0, 500),
      fingerprint: fingerprintFor(moduleName, message),
      stack,
      // jsonb accepts any JSON-serializable value
      context: extra as never,
    });
  } catch {
    // Logging must never throw — swallow DB errors silently.
    // The console.* call already happened; we lose only the DB row.
  }
}

export function logError(
  moduleName: string,
  message: string,
  context?: LogContext,
): void {
  if (context !== undefined) {
    console.error(format("error", moduleName, message), context);
  } else {
    console.error(format("error", moduleName, message));
  }
  // Fire-and-forget — don't block the error path on a DB write
  void persistError("error", moduleName, message, context);
}

export function logWarn(
  moduleName: string,
  message: string,
  context?: LogContext,
): void {
  if (context !== undefined) {
    console.warn(format("warn", moduleName, message), context);
  } else {
    console.warn(format("warn", moduleName, message));
  }
  void persistError("warn", moduleName, message, context);
}
