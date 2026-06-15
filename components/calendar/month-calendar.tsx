import Link from "next/link";
import type { CalendarCard } from "@/lib/calendar-queries";

type MonthCalendarProps = {
    year: number;
    month: number;
    cards: CalendarCard[];
};

function monthStart(year: number, month: number) {
    return new Date(Date.UTC(year, month, 1));
}

function monthEnd(year: number, month: number) {
    return new Date(Date.UTC(year, month + 1, 0));
}

function dateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function formatMonth(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function formatDayLabel(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function formatDueDate(iso: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
    }).format(new Date(iso));
}

export default function MonthCalendar({
    year,
    month,
    cards,
}: MonthCalendarProps) {
    const firstDay = monthStart(year, month);
    const lastDay = monthEnd(year, month);
    const daysInMonth = lastDay.getUTCDate();
    const leadingBlankDays = firstDay.getUTCDay();

    const monthCardsByDay = cards.reduce<Record<string, CalendarCard[]>>(
        (acc, card) => {
            const key = dateKey(new Date(card.dueDate));
            acc[key] ??= [];
            acc[key].push(card);
            return acc;
        },
        {},
    );

    const currentLabel = formatMonth(firstDay);
    const prevMonthDate = new Date(Date.UTC(year, month - 1, 1));
    const nextMonthDate = new Date(Date.UTC(year, month + 1, 1));
    const prevParam = prevMonthDate.toISOString().slice(0, 7);
    const nextParam = nextMonthDate.toISOString().slice(0, 7);

    const todayKey = dateKey(new Date());

    const dayCells: Array<{ key: string; date?: Date }> = [];

    for (let i = 0; i < leadingBlankDays; i += 1) {
        dayCells.push({ key: `blank-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        dayCells.push({
            key: `day-${day}`,
            date: new Date(Date.UTC(year, month, day)),
        });
    }

    const dueTasks = cards.filter((card) => !card.completed).length;
    const completed = cards.filter((card) => card.completed).length;

    const navLinkClass =
        "inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition hover:bg-muted/70";

    return (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <header className="border-b bg-muted/30 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {currentLabel}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Tasks with due dates appear on the day they are scheduled.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={`/calendar?month=${prevParam}`} className={navLinkClass}>
                                Previous
                            </Link>
                            <Link href={`/calendar?month=${nextParam}`} className={navLinkClass}>
                                Next
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-7 border-b text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="border-r px-3 py-2 last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7">
                    {dayCells.map((cell) => {
                        if (!cell.date) {
                            return (
                                <div
                                    key={cell.key}
                                    className="min-h-36 border-r border-b bg-muted/10 last:border-r-0"
                                />
                            );
                        }

                        const key = dateKey(cell.date);
                        const dayCards = monthCardsByDay[key] ?? [];
                        const isToday = key === todayKey;

                        return (
                            <div
                                key={cell.key}
                                className={`min-h-36 border-r border-b p-3 last:border-r-0 ${isToday ? "bg-primary/5" : "bg-background"
                                    }`}
                            >
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div>
                                        <p
                                            className={`text-sm font-semibold ${isToday ? "text-primary" : ""
                                                }`}
                                        >
                                            {cell.date.getUTCDate()}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {formatDayLabel(cell.date)}
                                        </p>
                                    </div>

                                    {dayCards.length > 0 ? (
                                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                                            {dayCards.length}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    {dayCards.slice(0, 3).map((card) => (
                                        <div
                                            key={card.id}
                                            className={`rounded-lg border px-2 py-1 text-xs shadow-sm ${card.completed
                                                    ? "bg-muted/40 text-muted-foreground line-through"
                                                    : "bg-background"
                                                }`}
                                        >
                                            <p className="break-words font-medium whitespace-normal">
                                                {card.title}
                                            </p>
                                            <p className="mt-0.5 break-words text-[11px] text-muted-foreground whitespace-normal">
                                                {card.boardTitle} · {card.columnTitle}
                                            </p>
                                        </div>
                                    ))}

                                    {dayCards.length > 3 ? (
                                        <p className="text-[11px] text-muted-foreground">
                                            +{dayCards.length - 3} more
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <aside className="space-y-6">
                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold">Deadline summary</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            A quick overview of what is coming up this month.
                        </p>
                    </div>

                    <div className="space-y-3 px-6 pb-6">
                        <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
                            <span className="text-sm text-muted-foreground">Due tasks</span>
                            <span className="text-lg font-semibold">{dueTasks}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
                            <span className="text-sm text-muted-foreground">Completed tasks</span>
                            <span className="text-lg font-semibold">{completed}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
                            <span className="text-sm text-muted-foreground">Tracked dates</span>
                            <span className="text-lg font-semibold">{cards.length}</span>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold">Upcoming deadlines</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Sorted by due date and linked to the board they belong to.
                        </p>
                    </div>

                    <div className="space-y-3 px-6 pb-6">
                        {cards.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No tasks with due dates yet. Add a due date to any card and it
                                will show up here.
                            </p>
                        ) : (
                            cards.slice(0, 8).map((card) => (
                                <div key={card.id} className="rounded-xl border px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p
                                                className={`break-words font-medium whitespace-normal ${card.completed
                                                        ? "line-through text-muted-foreground"
                                                        : ""
                                                    }`}
                                            >
                                                {card.title}
                                            </p>
                                            <p className="mt-1 break-words text-sm text-muted-foreground whitespace-normal">
                                                {card.boardTitle} · {card.columnTitle}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatDueDate(card.dueDate)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </aside>
        </div>
    );
}