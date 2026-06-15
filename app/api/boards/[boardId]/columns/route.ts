import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getBoardOwnership } from "@/lib/dashboard-queries";
import { jsonError, readJsonBody, text } from "@/lib/api-utils";

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

const MAX_TITLE_LENGTH = 60;

export const POST = withAuth(
  async (session, req: Request, context: RouteContext) => {
    const { boardId } = await context.params;

    const board = await getBoardOwnership(boardId, session.id);

    if (!board) {
      return jsonError("Board not found", 404);
    }

    const body = await readJsonBody(req);
    const title = text(body?.title);

    if (!title) {
      return jsonError("Title is required", 400);
    }

    if (title.length > MAX_TITLE_LENGTH) {
      return jsonError(
        `Title must be ${MAX_TITLE_LENGTH} characters or less`,
        400,
      );
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
  },
);
