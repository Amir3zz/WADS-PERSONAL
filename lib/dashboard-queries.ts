import { prisma } from "@/lib/prisma";

const dashboardBoardInclude = {
  columns: {
    orderBy: { position: "asc" as const },
    include: {
      cards: {
        select: {
          id: true,
          completed: true,
        },
      },
    },
  },
};

const boardTreeInclude = {
  columns: {
    orderBy: { position: "asc" as const },
    include: {
      cards: {
        orderBy: { position: "asc" as const },
      },
    },
  },
};

const columnTreeInclude = {
  cards: {
    orderBy: { position: "asc" as const },
  },
};

const columnContextInclude = {
  board: {
    select: {
      title: true,
    },
  },
};

const cardContextInclude = {
  column: {
    include: {
      board: {
        select: {
          title: true,
        },
      },
    },
  },
};

export function getDashboardBoards(userId: string) {
  return prisma.board.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: dashboardBoardInclude,
  });
}

export function getBoardTree(boardId: string, userId: string) {
  return prisma.board.findFirst({
    where: {
      id: boardId,
      userId,
    },
    include: boardTreeInclude,
  });
}

export function getBoardOwnership(boardId: string, userId: string) {
  return prisma.board.findFirst({
    where: {
      id: boardId,
      userId,
    },
    select: { id: true },
  });
}

export function getColumnTree(columnId: string, userId: string) {
  return prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        userId,
      },
    },
    include: columnTreeInclude,
  });
}

export function getColumnContext(columnId: string, userId: string) {
  return prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        userId,
      },
    },
    include: columnContextInclude,
  });
}

export function getColumnOwnership(columnId: string, userId: string) {
  return prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        userId,
      },
    },
    select: { id: true },
  });
}

export function getCardContext(cardId: string, userId: string) {
  return prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          userId,
        },
      },
    },
    include: cardContextInclude,
  });
}

export function getCardOwnership(cardId: string, userId: string) {
  return prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        board: {
          userId,
        },
      },
    },
    select: { id: true },
  });
}
