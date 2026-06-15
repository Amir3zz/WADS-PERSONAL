export default function Loading() {
    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                    <div className="space-y-2">
                        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-64 animate-pulse rounded bg-muted" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 space-y-3">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-72 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-96 animate-pulse rounded bg-muted" />
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[500px] w-[320px] shrink-0 animate-pulse rounded-3xl border bg-background shadow-sm"
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}