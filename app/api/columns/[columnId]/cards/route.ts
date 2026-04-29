import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCardAI } from "@/lib/ai";

type RouteContext = {
  params: Promise<{
    columnId: string;
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
  include: {
    board: {
      select: {
        title: true,
      },
    },
  },
});

  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const dueDateRaw = body?.dueDate;
  const dueDate = parseDateTimeInput(dueDateRaw);

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (dueDateRaw !== undefined && dueDateRaw !== null && String(dueDateRaw).trim() && !dueDate) {
    return NextResponse.json({ error: "Due date must be a valid date/time" }, { status: 400 });
  }

  const position = await prisma.card.count({
    where: { columnId: column.id },
  });

const ai = await generateCardAI({
  title,
  description: body?.description ?? null,
  dueDate: body?.dueDate ?? null,
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