/**
 * Minimal structured-log helper. Every module that used to call
 * `console.error("[module] ...")` calls `logError("module", ...)` instead
 * so the format is consistent.
 *
 * This is a pure static/public demo fork with no database — the original
 * `error_events` Neon-table persistence (for the /admin/errors dashboard)
 * was removed along with the rest of the admin panel. This now only
 * writes to the server console.
 */

type LogContext = Record<string, unknown> | Error | unknown;

function format(level: string, moduleName: string, message: string): string {
  return `[${moduleName}] ${message}`;
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
}
