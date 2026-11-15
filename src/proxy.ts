import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "db_admin_session";

/**
 * UX-level gate: bounces unauthenticated visitors to /admin/login when the
 * session cookie is absent. The authoritative check happens server-side in
 * the admin layout, every server action and every route handler.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname === "/admin") {
    return NextResponse.next();
  }
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
