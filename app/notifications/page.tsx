import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Bell, CalendarClock, ExternalLink } from "lucide-react";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getReminderCards, mapReminderItems } from "@/lib/reminder-queries";

function formatDueDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function reminderLabel(daysLeft: number) {
    if (daysLeft < 0) {
        return `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"}`;
    }

    if (daysLeft === 0) {
        return "Due today";
    }

    return `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
}

export default async function NotificationsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const displayName = session.name?.trim() || session.email;
    const initial = (
        session.name?.trim()?.[0] ??
        session.email?.[0] ??
        "?"
    ).toUpperCase();

    const reminders = mapReminderItems(await getReminderCards(session.id, 7));
    const overdue = reminders.filter((item) => item.status === "OVERDUE");
    const dueSoon = reminders.filter((item) => item.status === "DUE_SOON");

    return (
        <div className="min-h-screen bg-muted/30">
            <DashboardHeader
                initial={initial}
                displayName={displayName}
                reminderCount={reminders.length}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                        Notifications
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Due date reminders
                    </h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        This page shows the cards that need attention soon. It is driven by
                        task due dates, so it works as a simple reminder system.
                    </p>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground">Total reminders</p>
                            <p className="mt-2 text-3xl font-semibold">{reminders.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground">Overdue</p>
                            <p className="mt-2 text-3xl font-semibold">{overdue.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-muted-foreground">Due soon</p>
                            <p className="mt-2 text-3xl font-semibold">{dueSoon.length}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-red-500/10 p-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>Overdue tasks</CardTitle>
                                    <CardDescription>
                                        These cards already passed their due date.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {overdue.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No overdue tasks right now.
                                </p>
                            ) : (
                                overdue.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="break-words font-medium whitespace-normal">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 break-words text-sm text-muted-foreground whitespace-normal">
                                                    {item.boardTitle} · {item.columnTitle}
                                                </p>
                                                {item.description ? (
                                                    <p className="mt-2 break-words text-sm text-muted-foreground whitespace-normal">
                                                        {item.description}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span className="shrink-0 text-xs font-medium text-red-700 dark:text-red-300">
                                                {reminderLabel(item.daysLeft)}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-xs text-muted-foreground">
                                                Due {formatDueDate(item.dueDate)}
                                            </p>
                                            <Link
                                                href={`/board/${item.boardId}`}
                                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                            >
                                                Open board
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-amber-500/10 p-2 text-amber-700">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>Tasks due soon</CardTitle>
                                    <CardDescription>
                                        These card(s) are due within the next 7 days.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {dueSoon.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No upcoming due dates in the next 7 days.
                                </p>
                            ) : (
                                dueSoon.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl border bg-background p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="break-words font-medium whitespace-normal">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 break-words text-sm text-muted-foreground whitespace-normal">
                                                    {item.boardTitle} · {item.columnTitle}
                                                </p>
                                                {item.description ? (
                                                    <p className="mt-2 break-words text-sm text-muted-foreground whitespace-normal">
                                                        {item.description}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-300">
                                                {reminderLabel(item.daysLeft)}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-xs text-muted-foreground">
                                                Due {formatDueDate(item.dueDate)}
                                            </p>
                                            <Link
                                                href={`/board/${item.boardId}`}
                                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                            >
                                                Open board
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                    <CalendarClock className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>How this reminder system works</CardTitle>
                                    <CardDescription>
                                        It is intentionally simple and tied to your existing task due dates.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Add or edit a card due date, then the card will automatically appear
                            here when it is overdue or within the next 7 days.
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}