import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountDeletedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <Card className="w-full max-w-md border-border/70 shadow-sm">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-7 w-7" />
                    </div>

                    <CardTitle className="text-2xl">Account deleted</CardTitle>
                    <CardDescription>
                        Your account and related study planner data have been removed successfully.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/login">Back to login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}