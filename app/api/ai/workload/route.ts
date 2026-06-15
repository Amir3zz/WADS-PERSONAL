import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { generateWorkloadAI, type WorkloadTask } from "@/lib/workload-ai";

type WorkloadRouteContext = {
  params: Promise<Record<string, never>>;
};

export const POST = withAuth(
  async (session, _req: Request, _context: WorkloadRouteContext) => {
    const boards = await prisma.board.findMany({
      where: {
        userId: session.id,
      },
      include: {
        columns: {
          include: {
            cards: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const allTasks = boards.flatMap((board) =>
      board.columns.flatMap((column) =>
        column.cards.map((card) => ({
          title: card.title,
          boardTitle: board.title,
          columnTitle: column.title,
          dueDate: card.dueDate ? card.dueDate.toISOString() : null,
          priority: card.priority as "HIGH" | "MEDIUM" | "LOW" | null,
          completed: card.completed,
        })),
      ),
    );

    const openTasks = allTasks.filter((task) => !task.completed);
    const completedTasks = allTasks.filter((task) => task.completed).length;

    const now = Date.now();
    const overdueTasks = openTasks.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).getTime() < now;
    }).length;

    const dueSoonTasks = openTasks.filter((task) => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate).getTime();
      return due >= now && due <= now + 3 * 24 * 60 * 60 * 1000;
    }).length;

    const analysis = await generateWorkloadAI({
      totalBoards: boards.length,
      totalTasks: allTasks.length,
      openTasks: openTasks.length,
      completedTasks,
      overdueTasks,
      dueSoonTasks,
      tasks: openTasks.slice(0, 20) as WorkloadTask[],
    });

    return NextResponse.json({
      stats: {
        totalBoards: boards.length,
        totalTasks: allTasks.length,
        openTasks: openTasks.length,
        completedTasks,
        overdueTasks,
        dueSoonTasks,
      },
      analysis,
    });
  },
);
