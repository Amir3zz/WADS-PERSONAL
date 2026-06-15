import { prisma } from "@/lib/prisma";

export type ReminderItem = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  daysLeft: number;
  status: "OVERDUE" | "DUE_SOON";
  boardId: string;
  boardTitle: string;
  columnTitle: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function getDaysLeft(dueDate: Date, now: number) {
  const diff = dueDate.getTime() - now;
  if (diff >= 0) {
    return Math.ceil(diff / DAY_MS);
  }
  return -Math.ceil(Math.abs(diff) / DAY_MS);
}

function getReminderStatus(dueDate: Date, now: number): "OVERDUE" | "DUE_SOON" {
  return dueDate.getTime() < now ? "OVERDUE" : "DUE_SOON";
}

export function getReminderCards(userId: string, daysAhead = 7) {
  const now = new Date();
  const end = new Date(now.getTime() + daysAhead * DAY_MS);

  return prisma.card.findMany({
    where: {
      completed: false,
      dueDate: {
        not: null,
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
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export function mapReminderItems(
  cards: Awaited<ReturnType<typeof getReminderCards>>,
): ReminderItem[] {
  const now = Date.now();

  return cards.map((card) => {
    const dueDate = card.dueDate ?? new Date();

    return {
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: dueDate.toISOString(),
      daysLeft: getDaysLeft(dueDate, now),
      status: getReminderStatus(dueDate, now),
      boardId: card.column.board.id,
      boardTitle: card.column.board.title,
      columnTitle: card.column.title,
    };
  });
}

export async function getReminderCount(userId: string, daysAhead = 7) {
  const cards = await getReminderCards(userId, daysAhead);
  return cards.length;
}
