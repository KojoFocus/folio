import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Authenticated users hitting /login → send to dashboard
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Always allow the login page (the middleware function above handles
        // the redirect-away-if-already-authed case)
        if (pathname === "/login") return true;

        // Protected — must be signed in
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/chat") ||
          pathname.startsWith("/documents")
        ) {
          return !!token;
        }

        // Everything else (landing, /build, /review, /model, API routes) — public
        return true;
      },
    },
  }
);

// Only run middleware on these paths — keep it off static assets and internals
export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/chat/:path*",
    "/documents/:path*",
  ],
};
