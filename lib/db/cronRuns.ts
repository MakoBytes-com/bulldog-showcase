/**
 * Cron-run audit log helpers. Every daily/weekly cron writes one row
 * here at the end of its run so the admin overview can distinguish
 * "ran successfully — nothing new from the source" from "cron didn't
 * fire."
 */

import { sql } from "drizzle-orm";

import { db, schema } from "./index";
import { logWarn } from "@/lib/log";

export type CronName =
  | "scrape-harris"
  | "scrape-tx-permits"
  | "scrape-competitors"
  | "enrich-leads";

export type RecordCronRunInput = {
  name: CronName;
  status: "ok" | "error";
  startedAt: Date;
  rawCount?: number;
  insertedCount?: number;
  updatedCount?: number;
  detail?: Record<string, unknown>;
  errorMessage?: string;
};

export async function recordCronRun(input: RecordCronRunInput): Promise<void> {
  // A logging failure must never break the cron itself — wrap in
  // try/catch and only warn. This matches the audit-log policy used
  // for sales_lead_events writes.
  try {
    await db.insert(schema.cronRuns).values({
      name: input.name,
      status: input.status,
      rawCount: input.rawCount ?? null,
      insertedCount: input.insertedCount ?? null,
      updatedCount: input.updatedCount ?? null,
      elapsedMs: Date.now() - input.startedAt.getTime(),
      detail: input.detail ?? null,
      errorMessage: input.errorMessage ?? null,
      startedAt: input.startedAt,
    });
  } catch (err) {
    logWarn("cronRuns.record", "failed to insert cron_runs row", {
      name: input.name,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

export type CronStatusRow = {
  name: CronName;
  status: "ok" | "error";
  lastRunAt: Date;
  rawCount: number | null;
  insertedCount: number | null;
  updatedCount: number | null;
  errorMessage: string | null;
};

/** Latest run per cron name. Uses DISTINCT ON for a single round-trip. */
export async function getLatestCronRuns(
  names: CronName[],
): Promise<Map<CronName, CronStatusRow>> {
  const out = new Map<CronName, CronStatusRow>();
  if (names.length === 0) return out;

  // Note: we deliberately don't `WHERE name = ANY(${names})` — drizzle's
  // sql template expands a JS array into separate placeholders
  // (`($1, $2, ...)`) which Postgres rejects as a tuple, not an array.
  // The table holds one row per cron-run per day so DISTINCT ON keeps
  // at most a few rows; filtering by name in JS afterwards is cheaper
  // than the workaround.
  const rows = await db.execute<{
    name: string;
    status: string;
    last_run_at: string | Date;
    raw_count: number | null;
    inserted_count: number | null;
    updated_count: number | null;
    error_message: string | null;
  }>(sql`
    SELECT DISTINCT ON (name)
      name, status, finished_at AS last_run_at,
      raw_count, inserted_count, updated_count, error_message
    FROM cron_runs
    ORDER BY name, finished_at DESC
  `);

  // db.execute returns either a bare array or { rows: [...] } depending
  // on the driver path; narrow defensively.
  const list = Array.isArray(rows) ? rows : (rows as { rows?: unknown[] }).rows;
  if (!Array.isArray(list)) return out;

  for (const r of list) {
    const row = r as {
      name?: unknown;
      status?: unknown;
      last_run_at?: unknown;
      raw_count?: unknown;
      inserted_count?: unknown;
      updated_count?: unknown;
      error_message?: unknown;
    };
    if (typeof row.name !== "string") continue;
    const name = row.name as CronName;
    if (!names.includes(name)) continue;
    const status = row.status === "error" ? "error" : "ok";
    const lastRunAt =
      row.last_run_at instanceof Date
        ? row.last_run_at
        : typeof row.last_run_at === "string"
          ? new Date(row.last_run_at)
          : null;
    if (!lastRunAt) continue;
    out.set(name, {
      name,
      status,
      lastRunAt,
      rawCount: typeof row.raw_count === "number" ? row.raw_count : null,
      insertedCount:
        typeof row.inserted_count === "number" ? row.inserted_count : null,
      updatedCount:
        typeof row.updated_count === "number" ? row.updated_count : null,
      errorMessage:
        typeof row.error_message === "string" ? row.error_message : null,
    });
  }
  return out;
}
