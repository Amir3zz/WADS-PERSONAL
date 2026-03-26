"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type KanbanCardProps = {
  card: {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    position: number;
  };
};

export default function KanbanCard({ card }: KanbanCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [completed, setCompleted] = useState(card.completed);

  const handleDelete = async () => {
    const ok = window.confirm(`Delete "${card.title}"?`);
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete card");
      }

      toast.success("Card deleted");
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
      toast.error("Card title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          description: description.trim(),
          completed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update card");
      }

      toast.success("Card updated");
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
    <div className="rounded-2xl border bg-background p-3 shadow-sm transition hover:shadow-md">
      {!editing ? (
        <>
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium leading-snug">{card.title}</p>
              {card.description ? (
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                  {card.description}
                </p>
              ) : null}
            </div>

            {card.completed ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
                Done
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                Open
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setTitle(card.title);
                setDescription(card.description ?? "");
                setCompleted(card.completed);
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
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Mark as done
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}