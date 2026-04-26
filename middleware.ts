/**
 * Makopanel auth middleware. Protects /admin/* routes (except /admin/login)
 * by redirecting unauthenticated requests to /admin/login. The session
 * cookie itself is read in route handlers via getSession(); middleware
 * only does a coarse "is the cookie present and non-empty" gate so we
 * don't import iron-session crypto in edge middleware.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "mako_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Forward the pathname so the root layout can decide whether to render
  // the public-site chrome (TopBar / Header / Footer). Server Components
  // can't read the URL directly; this header is the standard escape hatch.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // Only /admin/* is protected.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Public sign-in surface — login, 2FA challenge, and the
  // password-reset request + consume pages must be reachable
  // without an existing session.
  const isPublicAuthRoute =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/2fa" ||
    pathname.startsWith("/admin/2fa/") ||
    pathname === "/admin/forgot" ||
    pathname.startsWith("/admin/forgot/") ||
    pathname === "/admin/reset" ||
    pathname.startsWith("/admin/reset/");

  if (isPublicAuthRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Coarse presence check — the session's userId / pendingUserId
  // distinction is enforced inside the (panel) layout, which reads
  // and decrypts the cookie. Here we only care that SOMETHING is
  // set, to keep the middleware off the session crypto path.
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie || !cookie.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

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
