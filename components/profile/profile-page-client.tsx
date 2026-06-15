"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { onAuthStateChanged, reload, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

type ProfileSession = {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  image: string | null;
};

type Props = {
  session: ProfileSession;
};

export default function ProfilePageClient({ session }: Props) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [currentUserEmail, setCurrentUserEmail] = useState(session.email);
  const [currentUserName, setCurrentUserName] = useState(session.name);
  const [currentImage, setCurrentImage] = useState<string | null>(session.image);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [requestingDeletion, setRequestingDeletion] = useState(false);

  const displayName = useMemo(
    () => currentUserName?.trim() || currentUserEmail,
    [currentUserEmail, currentUserName]
  );

  const initial = useMemo(
    () => (displayName?.trim()?.[0] ?? "?").toUpperCase(),
    [displayName]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        setLoadingAuth(false);
        return;
      }

      setCurrentUserEmail(user.email ?? session.email);
      setCurrentUserName(user.displayName ?? session.name);
      setCurrentImage(user.photoURL ?? session.image);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [session.email, session.image, session.name]);

  const requestAccountDeletion = useCallback(async () => {
    const user = currentUser ?? auth.currentUser;

    if (!user) {
      toast.error("No signed-in user found.");
      return;
    }

    try {
      setRequestingDeletion(true);

      await reload(user);

      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-delete`,
        handleCodeInApp: true,
      });

      toast.success(
        "A verification email has been sent. Open it to finish deleting your account."
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send verification email"
      );
    } finally {
      setRequestingDeletion(false);
    }
  }, [currentUser]);

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Link href="/dashboard" aria-label="Back to dashboard" title="Back to dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
            <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 border-b bg-background/60">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold">
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <div className="min-w-0">
              <CardTitle className="truncate text-2xl">{displayName}</CardTitle>
              <CardDescription className="truncate">{currentUserEmail}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Display name
                </p>
                <p className="mt-1 text-sm font-medium">{displayName}</p>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-1 break-all text-sm font-medium">{currentUserEmail}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border bg-background p-4">
              <div>
                <p className="font-medium">Session</p>
                <p className="text-sm text-muted-foreground">
                  You are currently signed in with Firebase authentication.
                </p>
              </div>

              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="shrink-0"
              >
                Return to main page
              </Button>
            </div>

            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-destructive/10 p-2 text-destructive">
                  <ShieldAlert className="h-4 w-4" />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-destructive">Delete account</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A verification email will be sent first. Once you verify it, your account
                      and all of its study data will be removed automatically.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="gap-2"
                        disabled={requestingDeletion}
                      >
                        <Trash2 className="h-4 w-4" />
                        {requestingDeletion ? "Sending email…" : "Delete account"}
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          We will send a verification email to{" "}
                          <span className="font-medium">{currentUserEmail}</span>. After you
                          open the link in that email, your account and study data will be
                          deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>No, take me back</AlertDialogCancel>
                        <AlertDialogAction onClick={requestAccountDeletion}>
                          Yes, send the email
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}