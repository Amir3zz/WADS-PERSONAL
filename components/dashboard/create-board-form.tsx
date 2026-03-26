"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CreateBoardForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Board title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create board");
      }

      toast.success("Board created");
      setTitle("");
      setDescription("");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {!open ? (
        <Button onClick={() => setOpen(true)} className="rounded-full px-5">
          <Plus className="mr-2 h-4 w-4" />
          Add board
        </Button>
      ) : (
        <form onSubmit={handleCreate} className="space-y-3 rounded-3xl border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">Create a new board</h3>
            <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board title"
            maxLength={80}
          />

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            maxLength={180}
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create board"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}