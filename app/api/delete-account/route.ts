import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
