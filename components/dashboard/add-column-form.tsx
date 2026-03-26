"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddColumnFormProps = {
  boardId: string;
  compact?: boolean;
};

export default function AddColumnForm({ boardId, compact = false }: AddColumnFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Column title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: cleanTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create column");
      }

      toast.success("Column created");
      setTitle("");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (compact && !open) {
    return (
      <Button
        variant="outline"
        className="h-full w-full rounded-3xl border-dashed py-10 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add column
      </Button>
    );
  }

  return (
    <div className={compact ? "w-full" : "w-fit"}>
      {!open ? (
        <Button variant={compact ? "ghost" : "outline"} onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add column
        </Button>
      ) : (
        <form onSubmit={handleCreate} className="w-full space-y-3 rounded-3xl border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">New column</h3>
            <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Column title"
            maxLength={60}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}