"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
    getIdToken,
    reload,
    sendEmailVerification,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyPage() {
    const router = useRouter();

    const createFirebaseSession = async (idToken: string) => {
        const res = await fetch("/api/auth/firebase", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message ?? data.error ?? "Failed to create session");
        }
    };

    const checkVerification = async () => {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            toast.error("No signed-in user found.");
            return;
        }

        await reload(currentUser);

        if (!currentUser.emailVerified) {
            toast.error("Your email is not verified yet.");
            return;
        }

        try {
            const idToken = await getIdToken(currentUser, true);
            await createFirebaseSession(idToken);

            toast.success("Email verified successfully!");
            router.push("/dashboard");
            router.refresh();
        } catch (err: unknown) {
            console.error(err);
            toast.error("Verification succeeded, but session creation failed.");
        }
    };

    const resendEmail = async () => {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            toast.error("No signed-in user found.");
            return;
        }

        await sendEmailVerification(currentUser);

        toast.success("Verification email sent again.");
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="max-w-md text-center space-y-6">
                <h1 className="text-2xl font-semibold">Verify your email</h1>

                <p className="text-muted-foreground">
                    We sent a verification link to your email address. Please click the
                    link before continuing.
                </p>

                <div className="flex flex-col gap-3">
                    <Button onClick={checkVerification}>I have verified my email</Button>

                    <Button variant="outline" onClick={resendEmail}>
                        Resend verification email
                    </Button>
                </div>
            </div>
        </div>
    );
}