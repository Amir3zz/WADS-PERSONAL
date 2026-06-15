"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type Status = "loading" | "error" | "success";

export default function VerifyDeleteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("Preparing account deletion...");

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                setStatus("loading");

                const mode = searchParams.get("mode");
                const oobCode = searchParams.get("oobCode");

                // If the code is present, apply it. If not, Firebase already handled it
                // on the hosted action page and redirected back here.
                if (oobCode) {
                    if (mode && mode !== "verifyEmail") {
                        throw new Error("This link is not an email verification link.");
                    }

                    setMessage("Verifying your email...");
                    await applyActionCode(auth, oobCode);
                }

                setMessage("Deleting your account and study data...");

                const response = await fetch("/api/delete-account", {
                    method: "DELETE",
                    credentials: "include",
                });

                let data: { error?: string } = {};
                try {
                    data = await response.json();
                } catch {
                    // ignore JSON parse errors
                }

                if (!response.ok) {
                    throw new Error(data.error || "Failed to delete account.");
                }

                if (cancelled) return;

                setStatus("success");
                setMessage("Account deleted successfully. Redirecting...");

                setTimeout(() => {
                    router.replace("/account-deleted");
                }, 1200);
            } catch (error) {
                console.error(error);

                if (cancelled) return;

                setStatus("error");
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong while processing the deletion."
                );
            }
        };

        void run();

        return () => {
            cancelled = true;
        };
    }, [router, searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Delete Account</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {status === "loading" && (
                        <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex justify-center">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{message}</span>
                            </div>

                            <Button asChild className="w-full">
                                <Link href="/profile">Back to Profile</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}