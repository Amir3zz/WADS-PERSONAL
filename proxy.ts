import { NextRequest, NextResponse } from "next/server";

const protectedApiRoutes = [
  "/api/boards",
  "/api/cards",
  "/api/columns",
];

const protectedPageRoutes = [
  "/dashboard",
  "/board",
  "/profile",
];

export function proxy(req: NextRequest) {
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

  if (!sessionCookie) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/board/:path*",
    "/profile/:path*",
  ],
};