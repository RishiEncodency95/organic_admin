import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass Next.js internal files, api endpoints, and static resources
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public authentication routes
  const isPublicRoute =
    pathname === "/login" ||
    pathname.startsWith("/reset-password");

  // Check for admin session cookie
  const authToken = request.cookies.get("ms_admin_token")?.value;

  // If not logged in and attempting to access any admin dashboard page, force redirect to /login
  if (!authToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /login, send directly to /
  if (authToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
