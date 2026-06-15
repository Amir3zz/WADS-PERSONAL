import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getBoardTree } from "@/lib/dashboard-queries";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/dashboard/kanban-board";

type BoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const board = await getBoardTree(boardId, session.id);

  if (!board) {
    notFound();
  }

  const serializedBoard = {
    id: board.id,
    title: board.title,
    description: board.description,
    columns: board.columns.map((column) => ({
      id: column.id,
      title: column.title,
      position: column.position,
      cards: column.cards.map((card) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        completed: card.completed,
        position: card.position,
        dueDate: card.dueDate ? card.dueDate.toISOString() : null,
        priority: card.priority as "HIGH" | "MEDIUM" | "LOW" | null,
        aiSubtasks: card.aiSubtasks,
        aiSuggestion: card.aiSuggestion,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      })),
    })),
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {serializedBoard.title}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {serializedBoard.description || "Your study board"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <KanbanBoard board={serializedBoard} />
      </main>
    </div>
  );
}