import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDashboardBoards } from "@/lib/dashboard-queries";
import { getReminderCards, mapReminderItems } from "@/lib/reminder-queries";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardEmptyState from "@/components/dashboard/dashboard-empty-state";
import SortableBoardGrid from "@/components/dashboard/sortable-board-grid";
import CreateBoardForm from "@/components/dashboard/create-board-form";
import WorkloadAnalysisCard from "@/components/dashboard/workload-analysis-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const boards = await getDashboardBoards(session.id);
  const reminders = mapReminderItems(await getReminderCards(session.id, 7));

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

  const upcoming = reminders.slice(0, 3);

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader
        initial={initial}
        displayName={displayName}
        reminderCount={reminders.length}
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

        <div className="mb-8">
          <WorkloadAnalysisCard />
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Reminders</CardTitle>
              <CardDescription>
                A quick view of the cards that need attention soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No due-date reminders right now.
                </p>
              ) : (
                upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-medium whitespace-normal">
                        {item.title}
                      </p>
                      <p className="mt-1 break-words text-sm text-muted-foreground whitespace-normal">
                        {item.boardTitle} · {item.columnTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDueDate(item.dueDate)}
                      </span>
                      <Link
                        href="/notifications"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
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