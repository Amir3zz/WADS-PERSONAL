import { NextRequest, NextResponse } from "next/server";

const protectedApiRoutes = [
  "/api/boards",
  "/api/cards",
  "/api/columns",
  "/api/user",
];

const protectedPageRoutes = [
  "/dashboard",
  "/board",
  "/account",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedApi = protectedApiRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isProtectedPage = protectedPageRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtectedApi && !isProtectedPage) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("session")?.value;

  // Allow requests only if a session cookie exists.
  // API routes still do the real auth check with getSession().
  if (!sessionCookie) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/board/:path*",
    "/account/:path*",
  ],
};