import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const idToken = authorization.replace("Bearer ", "");

  try {
    // Verify Firebase ID token
    const decodedToken = await adminAuth().verifyIdToken(idToken);

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email not found in Firebase token." },
        { status: 401 }
      );
    }

    // Get the latest profile information from Firebase
    const userRecord = await adminAuth().getUser(uid);

    const name =
      userRecord.displayName ??
      decodedToken.name ??
      null;

    const image =
      userRecord.photoURL ??
      (decodedToken as { picture?: string }).picture ??
      null;

    // Create or update the user in Prisma
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

    // Store session cookie
    const response = NextResponse.json({
      success: true,
      userId: user.id,
    });

    response.cookies.set("session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Firebase authentication error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed.",
      },
      { status: 401 }
    );
  }
}