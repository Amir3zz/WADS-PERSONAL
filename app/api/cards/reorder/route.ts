import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJsonBody } from "@/lib/api-utils";

type ColumnOrder = {
  columnId: string;
  cardIds: string[];
};

function parseColumnOrders(value: unknown): ColumnOrder[] | null {
  if (!Array.isArray(value)) return null;

  const orders = value.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as { columnId?: unknown }).columnId !== "string" ||
      !Array.isArray((item as { cardIds?: unknown }).cardIds) ||
      (item as { cardIds: unknown[] }).cardIds.some((id) => typeof id !== "string")
    ) {
      return null;
    }

    return item as ColumnOrder;
  });

  return orders.every(Boolean) ? (orders as ColumnOrder[]) : null;
}

export const PATCH = withAuth(async (session, req: Request) => {
  const body = await readJsonBody(req);
  const columns = parseColumnOrders(body?.columns);

  if (!columns) {
    return jsonError("Card order must include columns and card IDs", 400);
  }

  const columnIds = columns.map((column) => column.columnId);
  const cardIds = columns.flatMap((column) => column.cardIds);

  if (
    new Set(columnIds).size !== columnIds.length ||
    new Set(cardIds).size !== cardIds.length
  ) {
    return jsonError("Card order cannot contain duplicate IDs", 400);
  }

  const ownedColumns = await prisma.column.findMany({
    where: {
      id: { in: columnIds },
      board: { userId: session.id },
    },
    select: { id: true, boardId: true },
  });

  if (ownedColumns.length !== columnIds.length) {
    return jsonError("Card order contains an invalid column", 400);
  }

  const boardIds = new Set(ownedColumns.map((column) => column.boardId));

  if (boardIds.size !== 1) {
    return jsonError("Cards can only be reordered within one board", 400);
  }

  if (cardIds.length > 0) {
    const ownedCards = await prisma.card.findMany({
      where: {
        id: { in: cardIds },
        column: {
          board: { userId: session.id },
        },
      },
      select: {
        id: true,
        column: {
          select: { boardId: true },
        },
      },
    });

    if (ownedCards.length !== cardIds.length) {
      return jsonError("Card order contains an invalid card", 400);
    }

    const [boardId] = boardIds;
    const hasOutsideCard = ownedCards.some((card) => card.column.boardId !== boardId);

    if (hasOutsideCard) {
      return jsonError("Cards can only be reordered within one board", 400);
    }
  }

  await prisma.$transaction(
    columns.flatMap((column) =>
      column.cardIds.map((id, position) =>
        prisma.card.update({
          where: { id },
          data: {
            columnId: column.columnId,
            position,
          },
        }),
      ),
    ),
  );

  return NextResponse.json({ ok: true });
});
