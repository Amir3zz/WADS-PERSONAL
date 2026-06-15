import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import MonthCalendar from "@/components/calendar/month-calendar";
import { getSession } from "@/lib/auth";
import { getCalendarCards, mapCalendarCards } from "@/lib/calendar-queries";
import { getReminderCount } from "@/lib/reminder-queries";

type CalendarPageProps = {
    searchParams?: Promise<{
        month?: string;
    }> | {
        month?: string;
    };
};

function parseMonthParam(value?: string) {
    if (!value) {
        const now = new Date();
        return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
    }

    const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
    if (!match) {
        const now = new Date();
        return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
    }

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;

    if (month < 0 || month > 11) {
        const now = new Date();
        return { year: now.getUTCFullYear(), month: now.getUTCMonth() };
    }

    return { year, month };
}

function monthBounds(year: number, month: number) {
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    return { start, end };
}

export default async function CalendarPage({
    searchParams,
}: CalendarPageProps) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const resolvedSearchParams = await Promise.resolve(searchParams);
    const { year, month } = parseMonthParam(resolvedSearchParams?.month);
    const { start, end } = monthBounds(year, month);

    const cards = mapCalendarCards(await getCalendarCards(session.id, start, end));
    const reminderCount = await getReminderCount(session.id);

    const displayName = session.name?.trim() || session.email;
    const initial = (
        session.name?.trim()?.[0] ??
        session.email?.[0] ??
        "?"
    ).toUpperCase();

    return (
        <div className="min-h-screen bg-muted/30">
            <DashboardHeader
                initial={initial}
                displayName={displayName}
                reminderCount={reminderCount}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                        Calendar
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Task deadline calendar
                    </h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        Tasks with due dates appear on the day they are scheduled so you can
                        plan the month at a glance.
                    </p>
                </div>

                <MonthCalendar year={year} month={month} cards={cards} />
            </main>
        </div>
    );
}