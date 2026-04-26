import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(new URL("/admin/login", req.url), 303);
}

export async function GET(req: NextRequest) {
  return POST(req);
}
