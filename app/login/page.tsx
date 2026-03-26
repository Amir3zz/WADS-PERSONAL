"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { reload } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const createFirebaseSession = async (idToken: string) => {
    const res = await fetch("/api/auth/firebase", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to create session");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await createFirebaseSession(idToken);
      toast.success("Login successful");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Google sign-in failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const validateEmailPassword = (): string | null => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return "Please enter a valid email address.";
    if (!password) return "Password is required.";
    return null;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateEmailPassword();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await reload(result.user);

      if (!result.user.emailVerified) {
        toast.error("Please verify your email before signing in.");
        router.push("/verify");
        return;
      }

      const idToken = await result.user.getIdToken();

      await createFirebaseSession(idToken);

      toast.success("Login successful");

      router.push("/dashboard");
      router.refresh();

    } catch (err: unknown) {
      console.error(err);
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 py-10">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-primary/5 sm:border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Sign in to your account</CardTitle>
          <CardDescription>Use your email and password, or continue with Google.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? "Processing…" : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="h-10"
              />
            </div>
            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
              {loading ? "Signing in…" : "Sign in with Email"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-1">
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}