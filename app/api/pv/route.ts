import { db, schema } from "@/lib/db";
import { logError } from "@/lib/log";
import { readMeta, shouldAccept } from "@/lib/analytics/gatekeep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PvBody = {
  path?: unknown;
  referrer?: unknown;
  sessionId?: unknown;
};

// Trim the path early so a giant malformed URL can't blow out the index.
// 512 is comfortably above anything we'd actually route to.
const MAX_PATH = 512;
const MAX_REFERRER = 2048;
const MAX_UA = 2048;
const MAX_SESSION = 64;

function clamp(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

function asStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

export async function POST(req: Request) {
  const meta = readMeta(req);
  if (!shouldAccept(meta)) {
    return new Response(null, { status: 204 });
  }

  let body: PvBody;
  try {
    body = (await req.json()) as PvBody;
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = asStr(body.path);
  const sessionId = asStr(body.sessionId);
  if (!path || !sessionId) {
    return new Response(null, { status: 400 });
  }

  const referrer = asStr(body.referrer);

  try {
    await db.insert(schema.pageViews).values({
      path: clamp(path, MAX_PATH),
      referrer: referrer ? clamp(referrer, MAX_REFERRER) : null,
      userAgent: meta.userAgent ? clamp(meta.userAgent, MAX_UA) : null,
      sessionId: clamp(sessionId, MAX_SESSION),
      ip: meta.ip,
      country: meta.country,
    });
  } catch (err) {
    // Never let analytics break the page. Log and silently accept so the
    // client tracker doesn't retry-storm on a DB hiccup.
    logError("pv", "insert failed", err);
  }

  return new Response(null, { status: 204 });
}
