import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getBoardOwnership } from "@/lib/dashboard-queries";
import { jsonError, readJsonBody } from "@/lib/api-utils";

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }

  return value;
}

export const PATCH = withAuth(
  async (session, req: Request, context: RouteContext) => {
    const { boardId } = await context.params;
    const board = await getBoardOwnership(boardId, session.id);

    if (!board) {
      return jsonError("Board not found", 404);
    }

    const body = await readJsonBody(req);
    const columnIds = stringArray(body?.columnIds);

    if (!columnIds || new Set(columnIds).size !== columnIds.length) {
      return jsonError("Column order must include unique column IDs", 400);
    }

    const columns = await prisma.column.findMany({
      where: {
        id: { in: columnIds },
        boardId,
      },
      select: { id: true },
    });

    if (columns.length !== columnIds.length) {
      return jsonError("Column order contains an invalid column", 400);
    }

    await prisma.$transaction(
      columnIds.map((id, position) =>
        prisma.column.update({
          where: { id },
          data: { position },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  },
);
