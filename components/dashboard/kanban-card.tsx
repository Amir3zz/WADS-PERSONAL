"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
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
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    priority: "HIGH" | "MEDIUM" | "LOW" | null;
    aiSubtasks: string | null;
    aiSuggestion: string | null;
  };
  dragging?: boolean;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function formatDisplayDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function parseSubtasks(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    return [];
  }
}

const priorityStyles: Record<NonNullable<KanbanCardProps["card"]["priority"]>, string> = {
  HIGH: "bg-red-500/10 text-red-700",
  MEDIUM: "bg-amber-500/10 text-amber-700",
  LOW: "bg-emerald-500/10 text-emerald-700",
};

export default function KanbanCard({
  card,
  dragging,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: KanbanCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [dueDate, setDueDate] = useState(toDateTimeLocalValue(card.dueDate));
  const [completed, setCompleted] = useState(card.completed);

  const aiSubtasks = useMemo(() => parseSubtasks(card.aiSubtasks), [card.aiSubtasks]);

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
          dueDate: dueDate || null,
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
    <div
      draggable={draggable && !editing}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart?.(event);
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      aria-grabbed={dragging}
      aria-label={`Task card ${card.title}`}
      className={`rounded-2xl border bg-background p-3 shadow-sm transition hover:shadow-md ${dragging ? "cursor-grabbing opacity-60" : "cursor-grab"
        }`}
    >
      {!editing ? (
        <>
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium leading-snug">{card.title}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {card.priority ? (
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[card.priority]
                      }`}
                  >
                    {card.priority} priority
                  </span>
                ) : null}

                {card.dueDate ? (
                  <span className="rounded-full bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-700">
                    Due {formatDisplayDate(card.dueDate)}
                  </span>
                ) : null}

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

              {card.description ? (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {card.description}
                </p>
              ) : null}
            </div>
          </div>

          {(aiSubtasks.length > 0 || card.aiSuggestion) ? (
            <div className="mt-3 rounded-xl border bg-muted/20 p-3">
              <button
                type="button"
                onClick={() => setShowAiDetails((value) => !value)}
                className="flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={showAiDetails}
                aria-controls={`ai-details-${card.id}`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    AI study plan
                  </p>
                  <p className="text-sm font-medium">
                    {showAiDetails ? "Hide details" : "Show details"}
                  </p>
                </div>

                {showAiDetails ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {showAiDetails ? (
                <div id={`ai-details-${card.id}`} className="mt-3 space-y-3">
                  {aiSubtasks.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Suggested subtasks
                      </p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {aiSubtasks.map((task, index) => (
                          <li key={`${task}-${index}`} className="flex gap-2">
                            <span aria-hidden="true">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {card.aiSuggestion ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Suggestion
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {card.aiSuggestion}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <p className="mt-3 text-xs text-muted-foreground">
            Created {formatDisplayDate(card.createdAt)}
          </p>

          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setTitle(card.title);
                setDescription(card.description ?? "");
                setDueDate(toDateTimeLocalValue(card.dueDate));
                setCompleted(card.completed);
                setShowAiDetails(false);
                setEditing(true);
              }}
              aria-label={`Edit card ${card.title}`}
              title={`Edit card ${card.title}`}
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
              aria-label={`Delete card ${card.title}`}
              title={`Delete card ${card.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold">Edit card</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditing(false)}
              aria-label="Cancel editing card"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor={`card-title-${card.id}`}>
              Title
            </label>
            <Input
              id={`card-title-${card.id}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor={`card-description-${card.id}`}
            >
              Description
            </label>
            <textarea
              id={`card-description-${card.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor={`card-due-${card.id}`}>
              Due date and time
            </label>
            <Input
              id={`card-due-${card.id}`}
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm" htmlFor={`card-completed-${card.id}`}>
            <input
              id={`card-completed-${card.id}`}
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