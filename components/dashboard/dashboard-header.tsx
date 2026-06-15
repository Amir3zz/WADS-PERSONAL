import Link from "next/link";
import {
    Bell,
    CalendarDays,
    LayoutDashboard,
    TimerReset,
    UserRound,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";

type DashboardHeaderProps = {
    initial: string;
    displayName: string;
    reminderCount?: number;
};

const navLinkClass =
    "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/70";

export default function DashboardHeader({
    initial,
    displayName,
    reminderCount = 0,
}: DashboardHeaderProps) {
    return (
        <header className="border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/profile"
                        aria-label="Open profile"
                        title="Open profile"
                        className="flex items-center gap-3 rounded-2xl border border-transparent px-2 py-1 transition hover:border-border hover:bg-muted/70"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold shadow-sm">
                            {initial}
                        </div>

                        <div className="hidden sm:block">
                            <p className="text-sm font-medium leading-none">{displayName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">View account</p>
                        </div>
                    </Link>

                    <LogoutButton />
                </div>

                <nav className="flex flex-wrap items-center gap-2">
                    <Link href="/dashboard" className={navLinkClass}>
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link href="/calendar" className={navLinkClass}>
                        <CalendarDays className="h-4 w-4" />
                        Calendar
                    </Link>
                    <Link href="/study-timer" className={navLinkClass}>
                        <TimerReset className="h-4 w-4" />
                        Study timer
                    </Link>
                    <Link href="/notifications" className={navLinkClass}>
                        <Bell className="h-4 w-4" />
                        Notifications
                        {reminderCount > 0 ? (
                            <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                {reminderCount}
                            </span>
                        ) : null}
                    </Link>
                    <Link href="/profile" className={navLinkClass}>
                        <UserRound className="h-4 w-4" />
                        Profile
                    </Link>
                </nav>
            </div>
        </header>
    );
}