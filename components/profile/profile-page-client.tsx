"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
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

const PENDING_DELETE_KEY = "pending-account-deletion";

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
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [currentUserEmail, setCurrentUserEmail] = useState(session.email);
  const [currentUserName, setCurrentUserName] = useState(session.name);
  const [currentImage, setCurrentImage] = useState<string | null>(session.image);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [pendingDeletion, setPendingDeletion] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPendingDeletion(window.localStorage.getItem(PENDING_DELETE_KEY) === "true");
  }, []);

  const clearPendingDeletion = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(PENDING_DELETE_KEY);
    setPendingDeletion(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    const user = currentUser ?? auth.currentUser;

    if (!user) {
      toast.error("No signed-in user found.");
      return;
    }

    try {
      setDeletingAccount(true);
      await reload(user);

      if (!user.emailVerified) {
        toast.error("Please verify your email first.");
        return;
      }

      const res = await fetch("/api/account", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete account");
      }

      clearPendingDeletion();
      await signOut(auth);
      toast.success("Your account has been deleted.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  }, [clearPendingDeletion, currentUser, router]);

  const requestAccountDeletion = useCallback(async () => {
    const user = currentUser ?? auth.currentUser;

    if (!user) {
      toast.error("No signed-in user found.");
      return;
    }

    try {
      setRequestingDeletion(true);

      window.localStorage.setItem(PENDING_DELETE_KEY, "true");
      setPendingDeletion(true);

      await sendEmailVerification(user, {
        url: `${window.location.origin}/profile?delete=1`,
      });

      toast.success("A verification email has been sent. After verifying it, your account will be deleted.");
    } catch (error) {
      console.error(error);
      window.localStorage.removeItem(PENDING_DELETE_KEY);
      setPendingDeletion(false);
      toast.error(error instanceof Error ? error.message : "Failed to send verification email");
    } finally {
      setRequestingDeletion(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const shouldDelete = pendingDeletion && searchParams.get("delete") === "1";
    if (!shouldDelete || !currentUser) return;

    let cancelled = false;

    const run = async () => {
      await reload(currentUser);
      if (cancelled) return;

      if (currentUser.emailVerified) {
        await deleteAccount();
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pendingDeletion, searchParams, deleteAccount, currentUser]);

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
                      A verification email will be sent first. Once you verify it, your account and all of its study data will be removed automatically.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2" disabled={requestingDeletion || deletingAccount}>
                        <Trash2 className="h-4 w-4" />
                        {requestingDeletion || deletingAccount ? "Please wait…" : "Delete account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          We will send a verification email to <span className="font-medium">{currentUserEmail}</span>. After you verify it, your account will be deleted automatically.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No take me back</AlertDialogCancel>
                        <AlertDialogAction onClick={requestAccountDeletion}>
                          Yes I am sure
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
