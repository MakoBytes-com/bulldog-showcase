import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { getRecentDeployments } from "@/lib/vercel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Powers the auto-refresh of the Recent Deployments card on /admin.
 * Admin-only — returns the same shape the dashboard server-renders
 * with on initial load, so the client can swap in fresh data.
 */
export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await getRecentDeployments(6);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
