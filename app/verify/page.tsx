"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { reload, sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyPage() {

    const router = useRouter();

    const checkVerification = async () => {
        if (!auth.currentUser) return;

        await reload(auth.currentUser);

        if (auth.currentUser.emailVerified) {

            await fetch("/api/create-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: auth.currentUser.email,
                    name: auth.currentUser.displayName || "User",
                }),
            });

            toast.success("Email verified successfully!");
            router.push("/dashboard");

        } else {
            toast.error("Your email is not verified yet.");
        }
    };

    const resendEmail = async () => {
        if (!auth.currentUser) return;

        await sendEmailVerification(auth.currentUser);

        toast.success("Verification email sent again.");
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">

            <div className="max-w-md text-center space-y-6">

                <h1 className="text-2xl font-semibold">
                    Verify your email
                </h1>

                <p className="text-muted-foreground">
                    We sent a verification link to your email address.
                    Please click the link before continuing.
                </p>

                <div className="flex flex-col gap-3">

                    <Button onClick={checkVerification}>
                        I have verified my email
                    </Button>

                    <Button
                        variant="outline"
                        onClick={resendEmail}
                    >
                        Resend verification email
                    </Button>

                </div>

            </div>

        </div>
    );
}