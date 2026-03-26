import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authorization.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    const uid = decodedToken.uid;
    const email = decodedToken.email;
    if (!email) {
      return NextResponse.json({ error: "Email not found in token" }, { status: 401 });
    }

    const userRecord = await adminAuth.getUser(uid);
    const name = userRecord.displayName ?? decodedToken.name ?? null;
    const image = userRecord.photoURL ?? (decodedToken as { picture?: string }).picture ?? null;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        image,
      },
      create: {
        email,
        name,
        image,
        emailVerified: decodedToken.email_verified ?? false,
      },
    });

    const response = NextResponse.json({ status: "success", userId: user.id });
    response.cookies.set("session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Firebase auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}