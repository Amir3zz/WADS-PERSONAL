export default function Loading() {
    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                        </div>
                    </div>

                    <div className="h-10 w-24 animate-pulse rounded-2xl bg-muted" />
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 space-y-3">
                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-64 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-80 animate-pulse rounded bg-muted" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-56 animate-pulse rounded-3xl border bg-background shadow-sm"
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}