import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    columnId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
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
    include: {
      cards: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  return NextResponse.json(column);
}

export async function PATCH(req: Request, context: RouteContext) {
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
    select: { id: true },
  });

  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  const data: {
    title?: string;
    position?: number;
  } = {};

  if (body?.title !== undefined) {
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = title;
  }

  if (body?.position !== undefined) {
    const position = Number(body.position);
    if (!Number.isFinite(position)) {
      return NextResponse.json({ error: "Position must be a number" }, { status: 400 });
    }
    data.position = position;
  }

  const updated = await prisma.column.update({
    where: { id: columnId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
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
    select: { id: true },
  });

  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  await prisma.column.delete({
    where: { id: columnId },
  });

  return NextResponse.json({ ok: true });
}