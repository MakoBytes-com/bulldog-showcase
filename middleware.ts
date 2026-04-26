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

  // Only /admin/* is protected.
  if (!pathname.startsWith("/admin")) return NextResponse.next();

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

  if (isPublicAuthRoute) return NextResponse.next();

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
