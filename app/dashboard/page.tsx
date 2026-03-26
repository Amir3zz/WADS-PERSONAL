import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";
import CreateBoardForm from "@/components/dashboard/create-board-form";
import BoardCard from "@/components/dashboard/board-card";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const boards = await prisma.board.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: "desc" },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            select: {
              id: true,
              completed: true,
            },
          },
        },
      },
    },
  });

  const displayName = session.name?.trim() || session.email;
  const initial = (session.name?.trim()?.[0] ?? session.email?.[0] ?? "?").toUpperCase();

  const boardSummaries = boards.map((board) => {
    const totalCards = board.columns.reduce((sum, column) => sum + column.cards.length, 0);
    const completedCards = board.columns.reduce(
      (sum, column) => sum + column.cards.filter((card) => card.completed).length,
      0
    );

    const progress = totalCards === 0 ? 0 : Math.round((completedCards / totalCards) * 100);

    return {
      id: board.id,
      title: board.title,
      description: board.description,
      icon: board.icon,
      color: board.color,
      ownerName: displayName,
      progress,
      totalCards,
      updatedAt: board.updatedAt,
      columnCount: board.columns.length,
    };
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              {initial}
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Study Session</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {displayName}</p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
            <h2 className="text-3xl font-semibold tracking-tight">Your boards</h2>
            <p className="mt-2 text-muted-foreground">
              Continue where you left off or start a new study board.
            </p>
          </div>

          <CreateBoardForm />
        </div>

        {boardSummaries.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-background p-10 text-center shadow-sm">
            <h3 className="text-2xl font-semibold">No boards yet</h3>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Create your first study board for Math, Biology, Literature, or anything else you are
              organizing.
            </p>
            <div className="mt-6 flex justify-center">
              <CreateBoardForm />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {boardSummaries.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}