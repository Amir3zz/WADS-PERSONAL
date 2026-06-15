"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type WorkloadAnalysisResponse = {
    stats: {
        totalBoards: number;
        totalTasks: number;
        openTasks: number;
        completedTasks: number;
        overdueTasks: number;
        dueSoonTasks: number;
    };
    analysis: {
        riskLevel: "LOW" | "MEDIUM" | "HIGH";
        summary: string;
        recommendation: string;
        focusTasks: string[];
    };
};

function riskStyles(riskLevel: WorkloadAnalysisResponse["analysis"]["riskLevel"]) {
    if (riskLevel === "HIGH") {
        return "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200";
    }

    if (riskLevel === "MEDIUM") {
        return "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200";
    }

    return "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200";
}

function riskIcon(riskLevel: WorkloadAnalysisResponse["analysis"]["riskLevel"]) {
    if (riskLevel === "HIGH") return <AlertTriangle className="h-4 w-4" />;
    if (riskLevel === "MEDIUM") return <Sparkles className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
}

export default function WorkloadAnalysisCard() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<WorkloadAnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/ai/workload", {
                method: "POST",
            });

            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(payload?.error || "Failed to analyze workload");
            }

            setData(payload);
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/70 shadow-sm">
            <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl">Burnout / Overload Detection</CardTitle>
                        <CardDescription className="mt-1">
                            Analyze your current workload to see whether your deadlines are manageable or starting to pile up.
                        </CardDescription>
                    </div>

                    <Button onClick={handleAnalyze} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : data ? (
                            "Re-analyze"
                        ) : (
                            "Analyze workload"
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {error ? (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        {error}
                    </div>
                ) : null}

                {!data && !error ? (
                    <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                        Click <span className="font-medium text-foreground">Analyze workload</span> to check whether you are at low, medium, or high risk of overload.
                    </div>
                ) : null}

                {data ? (
                    <div className="space-y-4">
                        <div className={`rounded-2xl border p-4 ${riskStyles(data.analysis.riskLevel)}`}>
                            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                                {riskIcon(data.analysis.riskLevel)}
                                {data.analysis.riskLevel} risk
                            </div>

                            <p className="mt-3 text-sm leading-6">
                                {data.analysis.summary}
                            </p>

                            <p className="mt-3 text-sm leading-6">
                                <span className="font-semibold">Recommendation:</span> {data.analysis.recommendation}
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-4">
                            <div className="rounded-2xl bg-muted/30 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Boards</p>
                                <p className="mt-1 text-xl font-semibold">{data.stats.totalBoards}</p>
                            </div>
                            <div className="rounded-2xl bg-muted/30 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Open tasks</p>
                                <p className="mt-1 text-xl font-semibold">{data.stats.openTasks}</p>
                            </div>
                            <div className="rounded-2xl bg-muted/30 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Due soon</p>
                                <p className="mt-1 text-xl font-semibold">{data.stats.dueSoonTasks}</p>
                            </div>
                            <div className="rounded-2xl bg-muted/30 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Overdue</p>
                                <p className="mt-1 text-xl font-semibold">{data.stats.overdueTasks}</p>
                            </div>
                        </div>

                        {data.analysis.focusTasks.length > 0 ? (
                            <div className="rounded-2xl border bg-background p-4">
                                <p className="text-sm font-semibold">Tasks to focus on first</p>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    {data.analysis.focusTasks.map((task, index) => (
                                        <li key={`${task}-${index}`} className="flex gap-2">
                                            <span aria-hidden="true">•</span>
                                            <span>{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}