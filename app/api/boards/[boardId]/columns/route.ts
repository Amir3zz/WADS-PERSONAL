import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

export async function POST(req: Request, context: RouteContext) {
  const { boardId } = await context.params;

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      userId: session.id,
    },
    select: {
      id: true,
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const position = await prisma.column.count({
    where: { boardId: board.id },
  });

  const column = await prisma.column.create({
    data: {
      title,
      position,
      boardId: board.id,
    },
  });

  return NextResponse.json(column, { status: 201 });
}