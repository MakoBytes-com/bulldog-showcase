import { readMeta, shouldAccept } from "@/lib/analytics/gatekeep";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PvBody = {
  path?: unknown;
  referrer?: unknown;
  sessionId?: unknown;
};

function asStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

/**
 * Page-view beacon. This is a pure static/public demo fork with no
 * database — the original insert into `page_views` (read by the
 * /admin/analytics dashboard) was removed along with the rest of the
 * admin panel. The endpoint still validates + bot-filters the payload
 * and returns 204 so the client tracker (lib/track.ts) never sees a
 * failure, but nothing is persisted.
 */
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

  return new Response(null, { status: 204 });
}
