import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCardAI } from "@/lib/ai";
import { getCardContext, getCardOwnership } from "@/lib/dashboard-queries";
import {
  booleanValue,
  jsonError,
  nonNegativeInteger,
  parseDateTime,
  readJsonBody,
  text,
} from "@/lib/api-utils";

type RouteContext = {
  params: Promise<{
    cardId: string;
  }>;
};

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export async function GET(_req: Request, context: RouteContext) {
  const { cardId } = await context.params;
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
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
    return jsonError("Card not found", 404);
  }

  return NextResponse.json(card);
}

export async function PATCH(req: Request, context: RouteContext) {
  const { cardId } = await context.params;
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const existingCard = await getCardContext(cardId, session.id);

  if (!existingCard) {
    return jsonError("Card not found", 404);
  }

  const body = await readJsonBody(req);

  const data: {
    title?: string;
    description?: string | null;
    completed?: boolean;
    position?: number;
    dueDate?: Date | null;
  } = {};

  let shouldRegenerateAI = false;

  if (body?.title !== undefined) {
    const title = text(body.title);
    if (!title) {
      return jsonError("Title is required", 400);
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return jsonError(`Title must be ${MAX_TITLE_LENGTH} characters or less`, 400);
    }
    data.title = title;
    shouldRegenerateAI = true;
  }

  if (body?.description !== undefined) {
    const description = text(body.description);
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return jsonError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`, 400);
    }
    data.description = description || null;
    shouldRegenerateAI = true;
  }

  if (body?.dueDate !== undefined) {
    const dueDateRaw = body.dueDate;

    if (dueDateRaw === null || String(dueDateRaw).trim() === "") {
      data.dueDate = null;
      shouldRegenerateAI = true;
    } else {
      const dueDate = parseDateTime(dueDateRaw);

      if (!dueDate) {
        return jsonError("Due date must be a valid date/time", 400);
      }

      data.dueDate = dueDate;
      shouldRegenerateAI = true;
    }
  }

  if (body?.completed !== undefined) {
    const completed = booleanValue(body.completed);
    if (completed === null) {
      return jsonError("Completed must be a boolean", 400);
    }
    data.completed = completed;
  }

  if (body?.position !== undefined) {
    const position = nonNegativeInteger(body.position);
    if (position === null) {
      return jsonError("Position must be a non-negative integer", 400);
    }
    data.position = position;
  }

  if (Object.keys(data).length === 0) {
    return jsonError("No changes provided", 400);
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
      data.description !== undefined ? data.description : existingCard.description;
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
    return jsonError("Unauthorized", 401);
  }

  const card = await getCardOwnership(cardId, session.id);

  if (!card) {
    return jsonError("Card not found", 404);
  }

  await prisma.card.delete({
    where: { id: cardId },
  });

  return NextResponse.json({ ok: true });
}