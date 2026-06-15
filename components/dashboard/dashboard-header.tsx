import Link from "next/link";
import LogoutButton from "@/components/logout-button";

type DashboardHeaderProps = {
    initial: string;
    displayName: string;
};

export default function DashboardHeader({
    initial,
    displayName,
}: DashboardHeaderProps) {
    return (
        <header className="border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
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
                        <p className="text-sm font-medium leading-none">Profile</p>
                        <p className="mt-1 text-xs text-muted-foreground">View account</p>
                    </div>
                </Link>

                <LogoutButton />
            </div>
        </header>
    );
}