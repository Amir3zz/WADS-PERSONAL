import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const idToken = authorization.replace("Bearer ", "");

  try {
    const decodedToken = await adminAuth().verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email not found in Firebase token." },
        { status: 401 },
      );
    }

    const userRecord = await adminAuth().getUser(uid);

    const name = userRecord.displayName ?? decodedToken.name ?? null;

    const image =
      userRecord.photoURL ??
      (decodedToken as { picture?: string }).picture ??
      null;

    const user = await prisma.user.upsert({
      where: {
        firebaseUid: uid,
      },
      update: {
        email,
        name,
        image,
        emailVerified: decodedToken.email_verified ?? false,
      },
      create: {
        firebaseUid: uid,
        email,
        name,
        image,
        emailVerified: decodedToken.email_verified ?? false,
      },
    });

    const response = NextResponse.json({
      success: true,
      userId: user.id,
    });

    setSessionCookie(response, idToken);

    return response;
  } catch (error) {
    console.error("Firebase authentication error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed.",
      },
      { status: 401 },
    );
  }
}
