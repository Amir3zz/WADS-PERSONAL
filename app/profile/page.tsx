import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const displayName = session.name?.trim() || "Student";
  const initial = (session.name?.trim()?.[0] ?? session.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
          <h1 className="text-3xl font-semibold tracking-tight">Your account</h1>
          <p className="mt-2 text-muted-foreground">
            View your account details and sign out when you are done.
          </p>
        </div>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4 border-b bg-background/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              {initial}
            </div>

            <div className="min-w-0">
              <CardTitle className="truncate text-2xl">{displayName}</CardTitle>
              <CardDescription className="truncate">{session.email}</CardDescription>
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
                <p className="mt-1 break-all text-sm font-medium">{session.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border bg-background p-4">
              <div>
                <p className="font-medium">Session</p>
                <p className="text-sm text-muted-foreground">
                  You are currently signed in with Firebase authentication.
                </p>
              </div>

              <LogoutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}