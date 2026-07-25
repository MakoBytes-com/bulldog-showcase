/**
 * This is a pure static/public demo fork — the admin panel (and its
 * cookie-based auth gate) was removed, so this middleware no longer
 * protects /admin/*. It's kept only to forward the request pathname via
 * the x-pathname header, which the root layout reads (Server Components
 * can't read the URL directly) to decide whether to render the public
 * marketing chrome (TopBar / Header / Footer).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Match every route EXCEPT static assets so the root layout always sees
// x-pathname. The exclude list keeps middleware off Next.js internals
// and image optimization, which would otherwise add latency to every
// asset request.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|webm|woff2?|ttf|otf|eot|js\\.map|css\\.map)).*)",
  ],
};
