import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Lightweight cookie-existence guard; full session verification in server components
  const sessionToken =
    req.cookies.get("better-auth.session_token") ??
    req.cookies.get("__Secure-better-auth.session_token");

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/lobby", "/room/:path*"],
};