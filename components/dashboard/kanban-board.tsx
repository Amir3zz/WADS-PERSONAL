"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import KanbanColumn from "./kanban-column";
import AddColumnForm from "./add-column-form";

type KanbanBoardProps = {
  board: {
    id: string;
    title: string;
    description: string | null;
    columns: Array<{
      id: string;
      title: string;
      position: number;
      cards: Array<{
        id: string;
        title: string;
        description: string | null;
        completed: boolean;
        position: number;
        dueDate: string | null;
        createdAt: string;
        updatedAt: string;
        priority: "HIGH" | "MEDIUM" | "LOW" | null;
        aiSubtasks: string | null;
        aiSuggestion: string | null;
      }>;
    }>;
  };
};

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const router = useRouter();
  const [columns, setColumns] = useState(board.columns);
  const [draggedItem, setDraggedItem] = useState<
    | { type: "column"; columnId: string }
    | { type: "card"; cardId: string }
    | null
  >(null);

  useEffect(() => {
    setColumns(board.columns);
  }, [board.columns]);

  const totalCards = columns.reduce((sum, column) => sum + column.cards.length, 0);

  const saveColumns = async (nextColumns: typeof columns) => {
    const previousColumns = columns;
    setColumns(nextColumns);

    try {
      const res = await fetch(`/api/boards/${board.id}/columns/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnIds: nextColumns.map((column) => column.id) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save column order");
      }

      router.refresh();
    } catch (error) {
      setColumns(previousColumns);
      toast.error(error instanceof Error ? error.message : "Could not save column order");
    }
  };

  const saveCards = async (nextColumns: typeof columns) => {
    const previousColumns = columns;
    setColumns(nextColumns);

    try {
      const res = await fetch("/api/cards/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columns: nextColumns.map((column) => ({
            columnId: column.id,
            cardIds: column.cards.map((card) => card.id),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save card order");
      }

      router.refresh();
    } catch (error) {
      setColumns(previousColumns);
      toast.error(error instanceof Error ? error.message : "Could not save card order");
    }
  };

  const moveColumn = (targetColumnId: string) => {
    if (!draggedItem || draggedItem.type !== "column" || draggedItem.columnId === targetColumnId) {
      return;
    }

    const fromIndex = columns.findIndex((column) => column.id === draggedItem.columnId);
    const toIndex = columns.findIndex((column) => column.id === targetColumnId);

    if (fromIndex < 0 || toIndex < 0) return;

    const nextColumns = [...columns];
    const [column] = nextColumns.splice(fromIndex, 1);
    nextColumns.splice(toIndex, 0, column);
    void saveColumns(nextColumns);
  };

  const moveCard = (targetColumnId: string, targetCardId?: string) => {
    if (!draggedItem || draggedItem.type !== "card") return;

    const sourceColumn = columns.find((column) =>
      column.cards.some((card) => card.id === draggedItem.cardId),
    );
    const targetColumn = columns.find((column) => column.id === targetColumnId);

    if (!sourceColumn || !targetColumn) return;

    const draggedCard = sourceColumn.cards.find((card) => card.id === draggedItem.cardId);
    if (!draggedCard || draggedCard.id === targetCardId) return;

    const nextColumns = columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== draggedCard.id),
    }));

    const columnIndex = nextColumns.findIndex((column) => column.id === targetColumnId);
    const targetCards = [...nextColumns[columnIndex].cards];
    const targetIndex = targetCardId
      ? targetCards.findIndex((card) => card.id === targetCardId)
      : targetCards.length;

    targetCards.splice(targetIndex < 0 ? targetCards.length : targetIndex, 0, draggedCard);
    nextColumns[columnIndex] = {
      ...nextColumns[columnIndex],
      cards: targetCards,
    };

    void saveCards(nextColumns);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Board</p>
          <h2 className="text-3xl font-semibold tracking-tight">{board.title}</h2>
          <p className="mt-1 text-muted-foreground">
            {columns.length} columns · {totalCards} cards
          </p>
        </div>

        <AddColumnForm boardId={board.id} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            dragging={draggedItem?.type === "column" && draggedItem.columnId === column.id}
            draggedCardId={draggedItem?.type === "card" ? draggedItem.cardId : null}
            onColumnDragStart={() => setDraggedItem({ type: "column", columnId: column.id })}
            onColumnDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onColumnDrop={(event) => {
              event.preventDefault();
              moveColumn(column.id);
            }}
            onCardDragStart={(cardId) => setDraggedItem({ type: "card", cardId })}
            onCardDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.dataTransfer.dropEffect = "move";
            }}
            onCardDrop={(event, cardId) => {
              event.preventDefault();
              event.stopPropagation();
              moveCard(column.id, cardId);
            }}
            onColumnCardDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              moveCard(column.id);
            }}
            onDragEnd={() => setDraggedItem(null)}
          />
        ))}

        <div className="w-[320px] shrink-0">
          <AddColumnForm boardId={board.id} compact />
        </div>
      </div>
    </div>
  );
}
