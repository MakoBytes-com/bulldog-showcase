import { db, schema } from "@/lib/db";
import { logError } from "@/lib/log";
import { readMeta, shouldAccept } from "@/lib/analytics/gatekeep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EventBody = {
  name?: unknown;
  path?: unknown;
  sessionId?: unknown;
  data?: unknown;
};

const MAX_NAME = 128;
const MAX_PATH = 512;
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

  let body: EventBody;
  try {
    body = (await req.json()) as EventBody;
  } catch {
    return new Response(null, { status: 400 });
  }

  const name = asStr(body.name);
  const path = asStr(body.path);
  const sessionId = asStr(body.sessionId);
  if (!name || !path || !sessionId) {
    return new Response(null, { status: 400 });
  }

  const data =
    body.data && typeof body.data === "object" && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : null;

  try {
    await db.insert(schema.analyticsEvents).values({
      name: clamp(name, MAX_NAME),
      path: clamp(path, MAX_PATH),
      sessionId: clamp(sessionId, MAX_SESSION),
      data,
    });
  } catch (err) {
    logError("event", "insert failed", err);
  }

  return new Response(null, { status: 204 });
}
