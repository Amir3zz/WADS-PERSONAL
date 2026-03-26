"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddCardForm from "@/components/dashboard/add-card-form";
import KanbanCard from "@/components/dashboard/kanban-card";

type KanbanColumnProps = {
  column: {
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
  };
};

export default function KanbanColumn({ column }: KanbanColumnProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(column.title);

  const handleDelete = async () => {
    const ok = window.confirm(`Delete column "${column.title}" and all cards inside it?`);
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/columns/${column.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete column");
      }

      toast.success("Column deleted");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Column title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/columns/${column.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: cleanTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update column");
      }

      toast.success("Column updated");
      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[320px] shrink-0">
      <Card className="h-full border-border/70 shadow-sm">
        <CardContent className="space-y-4 p-4">
          {!editing ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{column.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {column.cards.length}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setTitle(column.title);
                      setEditing(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {column.cards.map((card) => (
                  <KanbanCard key={card.id} card={card} />
                ))}
              </div>

              <AddCardForm columnId={column.id} />
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Edit column</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}