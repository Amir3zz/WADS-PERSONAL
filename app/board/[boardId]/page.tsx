import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      userId: session.id,
    },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              completed: true,
              position: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!board) {
    notFound();
  }

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
              {board.title}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {board.description || "Your study board"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <KanbanBoard board={board} />
      </main>
    </div>
  );
}