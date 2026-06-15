import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getBoardOwnership, getBoardTree } from "@/lib/dashboard-queries";
import { jsonError, optionalText, readJsonBody, text } from "@/lib/api-utils";

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_ICON_LENGTH = 40;
const MAX_COLOR_LENGTH = 40;

export const GET = withAuth(
  async (session, _req: Request, context: RouteContext) => {
    const { boardId } = await context.params;
    const board = await getBoardTree(boardId, session.id);

    if (!board) {
      return jsonError("Board not found", 404);
    }

    return NextResponse.json(board);
  },
);

export const PATCH = withAuth(
  async (session, req: Request, context: RouteContext) => {
    const { boardId } = await context.params;

    const existingBoard = await getBoardOwnership(boardId, session.id);

    if (!existingBoard) {
      return jsonError("Board not found", 404);
    }

    const body = await readJsonBody(req);

    const data: {
      title?: string;
      description?: string | null;
      icon?: string | null;
      color?: string | null;
    } = {};

    if (body?.title !== undefined) {
      const title = text(body.title);
      if (!title) {
        return jsonError("Title is required", 400);
      }
      if (title.length > MAX_TITLE_LENGTH) {
        return jsonError(
          `Title must be ${MAX_TITLE_LENGTH} characters or less`,
          400,
        );
      }
      data.title = title;
    }

    if (body?.description !== undefined) {
      const description = optionalText(body.description);
      if ((description?.length ?? 0) > MAX_DESCRIPTION_LENGTH) {
        return jsonError(
          `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
          400,
        );
      }
      data.description = description;
    }

    if (body?.icon !== undefined) {
      const icon = optionalText(body.icon);
      if ((icon?.length ?? 0) > MAX_ICON_LENGTH) {
        return jsonError(
          `Icon must be ${MAX_ICON_LENGTH} characters or less`,
          400,
        );
      }
      data.icon = icon;
    }

    if (body?.color !== undefined) {
      const color = optionalText(body.color);
      if ((color?.length ?? 0) > MAX_COLOR_LENGTH) {
        return jsonError(
          `Color must be ${MAX_COLOR_LENGTH} characters or less`,
          400,
        );
      }
      data.color = color;
    }

    if (Object.keys(data).length === 0) {
      return jsonError("No changes provided", 400);
    }

    const updated = await prisma.board.update({
      where: { id: boardId },
      data,
    });

    return NextResponse.json(updated);
  },
);

export const DELETE = withAuth(
  async (session, _req: Request, context: RouteContext) => {
    const { boardId } = await context.params;

    const board = await getBoardOwnership(boardId, session.id);

    if (!board) {
      return jsonError("Board not found", 404);
    }

    await prisma.board.delete({
      where: { id: boardId },
    });

    return NextResponse.json({ ok: true });
  },
);
