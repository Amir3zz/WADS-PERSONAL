"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BoardCard from "@/components/dashboard/board-card";

type BoardSummary = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  ownerName: string;
  progress: number;
  totalCards: number;
  columnCount: number;
};

type SortableBoardGridProps = {
  boards: BoardSummary[];
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export default function SortableBoardGrid({ boards }: SortableBoardGridProps) {
  const router = useRouter();
  const [orderedBoards, setOrderedBoards] = useState(boards);
  const [draggedBoardId, setDraggedBoardId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedBoards(boards);
  }, [boards]);

  const saveBoardOrder = async (nextBoards: BoardSummary[]) => {
    const res = await fetch("/api/boards/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardIds: nextBoards.map((board) => board.id) }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Failed to save board order");
    }
  };

  const handleDrop = async (targetBoardId: string) => {
    if (!draggedBoardId || draggedBoardId === targetBoardId) return;

    const fromIndex = orderedBoards.findIndex((board) => board.id === draggedBoardId);
    const toIndex = orderedBoards.findIndex((board) => board.id === targetBoardId);

    if (fromIndex < 0 || toIndex < 0) return;

    const previousBoards = orderedBoards;
    const nextBoards = moveItem(orderedBoards, fromIndex, toIndex);

    setOrderedBoards(nextBoards);

    try {
      await saveBoardOrder(nextBoards);
      router.refresh();
    } catch (error) {
      setOrderedBoards(previousBoards);
      toast.error(error instanceof Error ? error.message : "Could not save board order");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {orderedBoards.map((board) => (
        <div
          key={board.id}
          draggable
          onDragStart={(event) => {
            setDraggedBoardId(board.id);
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            void handleDrop(board.id);
          }}
          onDragEnd={() => setDraggedBoardId(null)}
          className={
            draggedBoardId === board.id
              ? "cursor-grabbing opacity-60"
              : "cursor-grab"
          }
        >
          <BoardCard board={board} />
        </div>
      ))}
    </div>
  );
}
