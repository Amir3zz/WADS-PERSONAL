export default function Loading() {
    return (
        <div className="min-h-screen bg-muted/30 px-4 py-10">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="h-12 w-40 animate-pulse rounded-2xl bg-muted" />
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-64 animate-pulse rounded-3xl border bg-background shadow-sm"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}