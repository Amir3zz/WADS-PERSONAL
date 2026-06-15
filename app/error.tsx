"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <Card className="w-full max-w-md border-border/70 shadow-sm">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-7 w-7" />
                    </div>

                    <CardTitle className="text-2xl">Something went wrong</CardTitle>
                    <CardDescription>
                        An unexpected error happened while loading this page.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                    <Button className="w-full" onClick={reset}>
                        Try again
                    </Button>

                    <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard">Go to dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}