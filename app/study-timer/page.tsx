import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StudyTimerClient from "@/components/study-timer/study-timer-client";
import { getSession } from "@/lib/auth";
import { getStudySessions, mapStudySessions } from "@/lib/study-session-queries";
import { getReminderCount } from "@/lib/reminder-queries";

export default async function StudyTimerPage() {
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

    const initialSessions = mapStudySessions(await getStudySessions(session.id));
    const reminderCount = await getReminderCount(session.id);

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
                        Study timer
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Track focused study sessions
                    </h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        Use the timer to record focused work blocks, then save them into your
                        study history for progress analytics.
                    </p>
                </div>

                <StudyTimerClient initialSessions={initialSessions} />
            </main>
        </div>
    );
}