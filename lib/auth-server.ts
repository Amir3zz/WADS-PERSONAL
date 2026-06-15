import { NextResponse } from "next/server";
import { getSession, type SessionUser } from "@/lib/auth";

const SESSION_COOKIE_NAME = "session";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(SESSION_COOKIE_NAME, value, SESSION_COOKIE_OPTIONS);
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...SESSION_COOKIE_OPTIONS,
    expires: new Date(0),
  });
  return response;
}

export function withAuth<TArgs extends unknown[]>(
  handler: (
    session: SessionUser,
    ...args: TArgs
  ) => Promise<Response> | Response,
) {
  return async (...args: TArgs): Promise<Response> => {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(session, ...args);
  };
}
