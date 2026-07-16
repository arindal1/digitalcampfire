import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Lightweight cookie-existence guard; full session verification in server components
  const sessionToken =
    req.cookies.get("better-auth.session_token") ??
    req.cookies.get("__Secure-better-auth.session_token");

  const { pathname } = req.nextUrl;
  const isAuthPage =
    pathname === "/" || pathname === "/login" || pathname === "/register";

  // Redirect authenticated users away from public/auth pages
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/lobby", req.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthPage && !sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/lobby", "/room/:path*"],
};