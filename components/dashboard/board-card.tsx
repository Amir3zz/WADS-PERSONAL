"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type BoardCardProps = {
  board: {
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
};

export default function BoardCard({ board }: BoardCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description ?? "");
  const [icon, setIcon] = useState(board.icon ?? "");
  const [color, setColor] = useState(board.color ?? "");

  const handleDelete = async () => {
    const ok = window.confirm(`Delete "${board.title}"? This also removes its columns and cards.`);
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/boards/${board.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete board");
      }

      toast.success("Board deleted");
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
      toast.error("Board title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          description: description.trim(),
          icon: icon.trim(),
          color: color.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update board");
      }

      toast.success("Board updated");
      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const barColor = board.color || "#a3a3a3";

  return (
    <Card className="relative h-full overflow-hidden border-border/70 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="h-2 w-full" style={{ backgroundColor: barColor }} />

      <div className="absolute right-3 top-3 z-10 flex gap-2">
        {!editing ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                setTitle(board.title);
                setDescription(board.description ?? "");
                setIcon(board.icon ?? "");
                setColor(board.color ?? "");
                setEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setEditing(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CardContent className="flex h-full min-h-[240px] flex-col justify-between p-5">
        {!editing ? (
          <>
            <Link href={`/board/${board.id}`} className="block space-y-4 pr-20">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black uppercase tracking-tight">{board.title}</h3>
                  <p className="text-sm text-muted-foreground">Made by: {board.ownerName}</p>
                </div>

                {board.icon ? (
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-semibold text-white"
                    style={{ backgroundColor: barColor }}
                    aria-hidden
                  >
                    {board.icon}
                  </div>
                ) : null}
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">
                {board.description ||
                  `A study board with ${board.columnCount} columns and ${board.totalCards} cards.`}
              </p>

              <div className="space-y-3 pt-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress: {board.progress}%</span>
                  <span className="text-muted-foreground">{board.totalCards} cards</span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${board.progress}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            </Link>
          </>
        ) : (
          <form className="space-y-3 pr-20" onSubmit={handleSave}>
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={220}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Icon</label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Example: 📚"
                maxLength={8}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Color</label>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#22c55e"
                maxLength={32}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
  );
}