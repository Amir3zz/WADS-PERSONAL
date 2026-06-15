import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCardAI } from "@/lib/ai";
import { getColumnContext } from "@/lib/dashboard-queries";
import {
  jsonError,
  parseDateTime,
  readJsonBody,
  text,
} from "@/lib/api-utils";

type RouteContext = {
  params: Promise<{
    columnId: string;
  }>;
};

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export async function POST(req: Request, context: RouteContext) {
  const { columnId } = await context.params;
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const column = await getColumnContext(columnId, session.id);

  if (!column) {
    return jsonError("Column not found", 404);
  }

  const body = await readJsonBody(req);

  const title = text(body?.title);
  const description = text(body?.description);
  const dueDateRaw = body?.dueDate;
  const dueDate = parseDateTime(dueDateRaw);

  if (!title) {
    return jsonError("Title is required", 400);
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return jsonError(`Title must be ${MAX_TITLE_LENGTH} characters or less`, 400);
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return jsonError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`, 400);
  }

  if (
    dueDateRaw !== undefined &&
    dueDateRaw !== null &&
    String(dueDateRaw).trim() &&
    !dueDate
  ) {
    return jsonError("Due date must be a valid date/time", 400);
  }

  const position = await prisma.card.count({
    where: { columnId: column.id },
  });

  const ai = await generateCardAI({
    title,
    description: description || null,
    dueDate: dueDate ? dueDate.toISOString() : null,
    boardTitle: column.board.title,
    columnTitle: column.title,
  });

  const card = await prisma.card.create({
    data: {
      title,
      description: description || null,
      dueDate,
      position,
      columnId: column.id,
      priority: ai.priority,
      aiSubtasks: JSON.stringify(ai.subtasks),
      aiSuggestion: ai.suggestion,
    },
  });

  return NextResponse.json(card, { status: 201 });
}