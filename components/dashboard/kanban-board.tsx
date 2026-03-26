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
      }>;
    }>;
  };
};

export default function KanbanBoard({ board }: KanbanBoardProps) {
  const totalCards = board.columns.reduce((sum, column) => sum + column.cards.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Board</p>
          <h2 className="text-3xl font-semibold tracking-tight">{board.title}</h2>
          <p className="mt-1 text-muted-foreground">
            {board.columns.length} columns · {totalCards} cards
          </p>
        </div>

        <AddColumnForm boardId={board.id} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}

        <div className="w-[320px] shrink-0">
          <AddColumnForm boardId={board.id} compact />
        </div>
      </div>
    </div>
  );
}