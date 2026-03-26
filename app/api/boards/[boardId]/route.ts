import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
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
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  return NextResponse.json(board);
}

export async function PATCH(req: Request, context: RouteContext) {
  const { boardId } = await context.params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingBoard = await prisma.board.findFirst({
    where: {
      id: boardId,
      userId: session.id,
    },
    select: { id: true },
  });

  if (!existingBoard) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  const title = String(body?.title ?? "").trim();
  const descriptionRaw = body?.description;
  const iconRaw = body?.icon;
  const colorRaw = body?.color;

  const data: {
    title?: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
  } = {};

  if (body?.title !== undefined) {
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = title;
  }

  if (body?.description !== undefined) {
    const description = String(descriptionRaw ?? "").trim();
    data.description = description || null;
  }

  if (body?.icon !== undefined) {
    const icon = String(iconRaw ?? "").trim();
    data.icon = icon || null;
  }

  if (body?.color !== undefined) {
    const color = String(colorRaw ?? "").trim();
    data.color = color || null;
  }

  const updated = await prisma.board.update({
    where: { id: boardId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
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
    select: { id: true },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  await prisma.board.delete({
    where: { id: boardId },
  });

  return NextResponse.json({ ok: true });
}