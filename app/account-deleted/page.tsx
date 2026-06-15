import Link from "next/link";
import { ArrowLeft, CheckCircle2, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AccountDeletedPage() {
    return (
        <div className="min-h-screen bg-muted/30 px-4 py-10">
            <div className="mx-auto max-w-3xl">
                {/* Back button */}
                <Button asChild variant="ghost" className="mb-6">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to main page
                    </Link>
                </Button>

                <Card className="overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="items-center border-b bg-background/60 text-center">
                        <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>

                        <CardTitle className="text-3xl">
                            Account Successfully Deleted
                        </CardTitle>

                        <CardDescription className="max-w-lg text-base">
                            Your email has been successfully verified and your Study Planner
                            account has been permanently removed from our system.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 p-8">
                        <div className="rounded-xl bg-muted/40 p-5">
                            <h2 className="mb-2 font-semibold">What happened?</h2>

                            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                <li>Your Firebase authentication account has been deleted.</li>
                                <li>Your Study Planner profile has been removed.</li>
                                <li>Your boards, tasks, and related data have been permanently deleted.</li>
                                <li>This action cannot be undone.</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border bg-background p-5">
                            <p className="text-sm text-muted-foreground">
                                Thank you for trying Study Planner. If you ever decide to come
                                back, you're always welcome to create a new account.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Button asChild size="lg">
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Return to Main Page
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}