import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    columnId: string;
  }>;
};

export async function POST(req: Request, context: RouteContext) {
  const { columnId } = await context.params;

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        userId: session.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const position = await prisma.card.count({
    where: { columnId: column.id },
  });

  const card = await prisma.card.create({
    data: {
      title,
      position,
      columnId: column.id,
    },
  });

  return NextResponse.json(card, { status: 201 });
}