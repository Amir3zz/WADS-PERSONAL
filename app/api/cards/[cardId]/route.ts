import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCardAI } from "@/lib/ai";

type RouteContext = {
  params: Promise<{
    cardId: string;
  }>;
};

function parseDateTimeInput(value: unknown): Date | null {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  if (!text) return null;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

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

  const existingCard = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          userId: session.id,
        },
      },
    },
    include: {
      column: {
        include: {
          board: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!existingCard) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  const data: {
    title?: string;
    description?: string | null;
    completed?: boolean;
    position?: number;
    dueDate?: Date | null;
  } = {};

  let shouldRegenerateAI = false;

  if (body?.title !== undefined) {
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = title;
    shouldRegenerateAI = true;
  }

  if (body?.description !== undefined) {
    const description = String(body.description ?? "").trim();
    data.description = description || null;
    shouldRegenerateAI = true;
  }

  if (body?.dueDate !== undefined) {
    const dueDateRaw = body.dueDate;
    const dueDate = parseDateTimeInput(dueDateRaw);

    if (dueDateRaw !== null && String(dueDateRaw).trim() && !dueDate) {
      return NextResponse.json(
        { error: "Due date must be a valid date/time" },
        { status: 400 },
      );
    }

    data.dueDate = dueDate;
    shouldRegenerateAI = true;
  }

  if (body?.completed !== undefined) {
    data.completed = Boolean(body.completed);
  }

  if (body?.position !== undefined) {
    const position = Number(body.position);
    if (!Number.isFinite(position)) {
      return NextResponse.json(
        { error: "Position must be a number" },
        { status: 400 },
      );
    }
    data.position = position;
  }

  let aiData:
    | {
        priority: string;
        aiSubtasks: string;
        aiSuggestion: string;
      }
    | undefined;

  if (shouldRegenerateAI) {
    const nextTitle = data.title ?? existingCard.title;
    const nextDescription =
      data.description !== undefined
        ? data.description
        : existingCard.description;
    const nextDueDate =
      data.dueDate !== undefined ? data.dueDate : existingCard.dueDate;

    const ai = await generateCardAI({
      title: nextTitle,
      description: nextDescription,
      dueDate: nextDueDate ? nextDueDate.toISOString() : null,
      boardTitle: existingCard.column.board.title,
      columnTitle: existingCard.column.title,
    });

    aiData = {
      priority: ai.priority,
      aiSubtasks: JSON.stringify(ai.subtasks),
      aiSuggestion: ai.suggestion,
    };
  }

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      ...data,
      ...(aiData ?? {}),
    },
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