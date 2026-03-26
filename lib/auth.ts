import { cookies, headers } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * Returns the current session user from either Firebase (session cookie)
 * or Better Auth (session cookies). User data is always loaded from Prisma.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  // Try Firebase ID token (Google or Firebase email/password)
  if (sessionCookie) {
    try {
      const decodedToken: DecodedIdToken = await adminAuth.verifyIdToken(sessionCookie, true);
      const user = await prisma.user.findUnique({
        where: { email: decodedToken.email! },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    } catch {
      // Not a valid Firebase token or user not in DB; fall through to Better Auth
    }
  }

  // Try Better Auth session (email/password sign-in from register page)
  try {
    const headersList = await headers();
    const betterAuthSession = await auth.api.getSession({
      headers: headersList,
    });

    if (betterAuthSession?.user) {
      const user = await prisma.user.findUnique({
        where: { id: betterAuthSession.user.id },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }
  } catch {
    // Ignore; return null
  }

  return null;
}