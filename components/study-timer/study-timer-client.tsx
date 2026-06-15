"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { StudySessionRecord } from "@/lib/study-session-queries";

type StudyTimerClientProps = {
    initialSessions: StudySessionRecord[];
};

function formatDuration(seconds: number) {
    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
}

function formatSessionDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function StudyTimerClient({
    initialSessions,
}: StudyTimerClientProps) {
    const router = useRouter();
    const [title, setTitle] = useState("Study session");
    const [subject, setSubject] = useState("");
    const [notes, setNotes] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [saving, setSaving] = useState(false);
    const [sessions, setSessions] = useState(initialSessions);
    const startedAtRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentDurationLabel = useMemo(
        () => formatDuration(elapsedSeconds),
        [elapsedSeconds],
    );

    useEffect(() => {
        if (!isRunning) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = setInterval(() => {
            setElapsedSeconds((value) => value + 1);
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startTimer = () => {
        if (isRunning) {
            return;
        }

        if (startedAtRef.current === null) {
            startedAtRef.current = Date.now();
        }

        setIsRunning(true);
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setElapsedSeconds(0);
        startedAtRef.current = null;
    };

    const saveSession = async () => {
        if (elapsedSeconds <= 0) {
            toast.error("Start the timer before saving a session.");
            return;
        }

        const startedAt = startedAtRef.current ?? Date.now() - elapsedSeconds * 1000;

        try {
            setSaving(true);

            const endedAt = Date.now();
            const payload = {
                title: title.trim() || "Study session",
                subject: subject.trim() || null,
                notes: notes.trim() || null,
                startedAt: new Date(startedAt).toISOString(),
                endedAt: new Date(endedAt).toISOString(),
                durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
            };

            const res = await fetch("/api/study-sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? data.message ?? "Failed to save session");
            }

            const saved = (await res.json()) as StudySessionRecord;
            setSessions((current) => [saved, ...current]);
            toast.success("Study session saved");
            router.refresh();
            resetTimer();
        } catch (err: unknown) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const totalMinutesThisWeek = useMemo(() => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return sessions.reduce((sum, session) => {
            const started = new Date(session.startedAt).getTime();
            return started >= weekAgo ? sum + (session.durationMinutes ?? 0) : sum;
        }, 0);
    }, [sessions]);

    return (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
                <CardHeader>
                    <CardTitle>Study session timer</CardTitle>
                    <CardDescription>
                        Start the timer while you study, then save the session to build
                        your productivity history.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="rounded-3xl border bg-muted/20 p-6 text-center">
                        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                            Current session
                        </p>
                        <p className="mt-3 text-5xl font-semibold tracking-tight">
                            {currentDurationLabel}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isRunning ? "Timer running" : "Timer paused"}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Button onClick={startTimer} disabled={isRunning}>
                            Start
                        </Button>
                        <Button onClick={pauseTimer} variant="outline" disabled={!isRunning}>
                            Pause
                        </Button>
                        <Button onClick={resetTimer} variant="outline">
                            Reset
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Session title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Study session"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Math, Programming, Biology..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What did you work on?"
                            />
                        </div>
                    </div>

                    <Button className="w-full" onClick={saveSession} disabled={saving}>
                        {saving ? "Saving…" : "Save session"}
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Productivity summary</CardTitle>
                        <CardDescription>A simple view of your logged study time.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border bg-muted/20 p-4">
                            <p className="text-sm text-muted-foreground">Sessions saved</p>
                            <p className="mt-1 text-2xl font-semibold">{sessions.length}</p>
                        </div>
                        <div className="rounded-xl border bg-muted/20 p-4">
                            <p className="text-sm text-muted-foreground">Minutes this week</p>
                            <p className="mt-1 text-2xl font-semibold">{totalMinutesThisWeek}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent sessions</CardTitle>
                        <CardDescription>
                            Saved sessions are stored in the database and can be used for
                            progress analytics later.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No saved sessions yet. Start the timer and save your first study
                                block.
                            </p>
                        ) : (
                            sessions.slice(0, 8).map((session) => (
                                <div key={session.id} className="rounded-xl border px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">{session.title}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {session.subject ?? "No subject"}
                                            </p>
                                            {session.notes ? (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {session.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="text-right text-sm text-muted-foreground">
                                            <p>{session.durationMinutes ?? 0} min</p>
                                            <p className="mt-1">{formatSessionDate(session.startedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}