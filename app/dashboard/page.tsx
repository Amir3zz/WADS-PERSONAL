import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDashboardBoards } from "@/lib/dashboard-queries";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardEmptyState from "@/components/dashboard/dashboard-empty-state";
import SortableBoardGrid from "@/components/dashboard/sortable-board-grid";
import CreateBoardForm from "@/components/dashboard/create-board-form";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const boards = await getDashboardBoards(session.id);

  const displayName = session.name?.trim() || session.email;

  const initial = (
    session.name?.trim()?.[0] ??
    session.email?.[0] ??
    "?"
  ).toUpperCase();

  const boardSummaries = boards.map((board) => {
    const totalCards = board.columns.reduce(
      (sum, column) => sum + column.cards.length,
      0,
    );

    const completedCards = board.columns.reduce(
      (sum, column) =>
        sum + column.cards.filter((card) => card.completed).length,
      0,
    );

    const progress =
      totalCards === 0
        ? 0
        : Math.round((completedCards / totalCards) * 100);

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
      <DashboardHeader
        initial={initial}
        displayName={displayName}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Dashboard
            </p>

            <h2 className="text-3xl font-semibold tracking-tight">
              Your boards
            </h2>

            <p className="mt-2 text-muted-foreground">
              Continue where you left off or start a new study board.
            </p>
          </div>

          <CreateBoardForm />
        </div>

        {boardSummaries.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <SortableBoardGrid boards={boardSummaries} />
        )}
      </main>
    </div>
  );
}