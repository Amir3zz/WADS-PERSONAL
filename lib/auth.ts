import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import type { DecodedIdToken } from "firebase-admin/auth";

export interface SessionUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  image: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken: DecodedIdToken = await adminAuth().verifyIdToken(
      sessionCookie,
      true
    );

    const user = await prisma.user.findUnique({
      where: {
        firebaseUid: decodedToken.uid,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  } catch {
    return null;
  }
}
