"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddCardFormProps = {
  columnId: string;
};

export default function AddCardForm({ columnId }: AddCardFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Card title is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/columns/${columnId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: cleanTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create card");
      }

      toast.success("Card created");
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

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add card
      </Button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">New card</span>
        <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title"
        maxLength={100}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}