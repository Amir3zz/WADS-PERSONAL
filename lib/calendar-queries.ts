import { prisma } from "@/lib/prisma";

export type CalendarCard = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  completed: boolean;
  priority: string | null;
  boardTitle: string;
  columnTitle: string;
};

export function getCalendarCards(userId: string, start: Date, end: Date) {
  return prisma.card.findMany({
    where: {
      dueDate: {
        gte: start,
        lte: end,
      },
      column: {
        board: {
          userId,
        },
      },
    },
    orderBy: [{ dueDate: "asc" }, { position: "asc" }],
    include: {
      column: {
        select: {
          title: true,
          board: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
}

export function mapCalendarCards(
  cards: Awaited<ReturnType<typeof getCalendarCards>>,
): CalendarCard[] {
  return cards.map((card) => ({
    id: card.id,
    title: card.title,
    description: card.description,
    dueDate: card.dueDate?.toISOString() ?? "",
    completed: card.completed,
    priority: card.priority,
    boardTitle: card.column.board.title,
    columnTitle: card.column.title,
  }));
}
