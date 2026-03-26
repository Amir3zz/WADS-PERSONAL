import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    cardId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { cardId } = await context.params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          userId: session.id,
        },
      },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PATCH(req: Request, context: RouteContext) {
  const { cardId } = await context.params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          userId: session.id,
        },
      },
    },
    select: { id: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  const data: {
    title?: string;
    description?: string | null;
    completed?: boolean;
    position?: number;
  } = {};

  if (body?.title !== undefined) {
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = title;
  }

  if (body?.description !== undefined) {
    const description = String(body.description ?? "").trim();
    data.description = description || null;
  }

  if (body?.completed !== undefined) {
    data.completed = Boolean(body.completed);
  }

  if (body?.position !== undefined) {
    const position = Number(body.position);
    if (!Number.isFinite(position)) {
      return NextResponse.json({ error: "Position must be a number" }, { status: 400 });
    }
    data.position = position;
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { cardId } = await context.params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          userId: session.id,
        },
      },
    },
    select: { id: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.card.delete({
    where: { id: cardId },
  });

  return NextResponse.json({ ok: true });
}