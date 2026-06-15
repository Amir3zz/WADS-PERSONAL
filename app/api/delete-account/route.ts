import { NextResponse } from "next/server";
import { withAuth, clearSessionCookie } from "@/lib/auth-server";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export const DELETE = withAuth(async (session) => {
  try {
    const firebaseUser = await adminAuth().getUser(session.firebaseUid);

    if (!firebaseUser.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email first." },
        { status: 403 },
      );
    }

    await adminAuth().deleteUser(session.firebaseUid);

    await prisma.user.delete({
      where: {
        firebaseUid: session.firebaseUid,
      },
    });

    const response = NextResponse.json({ success: true });

    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
});
