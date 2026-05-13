/**
 * Neon + Drizzle client for Makopanel. Uses the HTTP driver which
 * works in all Vercel runtimes (Node + Edge) without needing a
 * long-lived connection pool. For bulkier admin queries we still
 * prefer Node runtime so we can use transactions if needed.
 *
 * `import "server-only"` is the build-time guard that stops this
 * module from ever reaching a client bundle. The top-level throw on
 * missing DATABASE_URI was supposed to be defensive but ends up
 * catastrophic if the module leaks into the browser (it crashes the
 * chunk on hydration with "DATABASE_URI env var is not set" — see
 * feedback_no_db_imports_in_client_components.md).
 */

import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// DATABASE_URI check deferred to first query via a lazy Proxy.
// Module-load throw was crashing Vercel Preview builds for Dependabot
// PRs where prod env vars aren't scoped. neon() validates URL format
// at construction time (won't accept a placeholder), so we lazily
// initialize on first property access. The real connection error
// surfaces at use-time if DATABASE_URI is missing.
type DbClient = ReturnType<typeof drizzle<typeof schema>>;
let _db: DbClient | null = null;

function getDb(): DbClient {
  if (_db) return _db;
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) {
    throw new Error("DATABASE_URI env var is not set");
  }
  const sql = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    return Reflect.get(getDb() as object, prop);
  },
});
export { schema };
