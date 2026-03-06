"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";
  const urlError     = searchParams.get("error");

  const [mode, setMode]         = useState<Mode>("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState<"google" | "email" | null>(null);
  const [error, setError]       = useState(urlError ? friendlyError(urlError) : "");

  // ── Google OAuth ────────────────────────────────────────────────────────────
  async function handleGoogle() {
    setError("");
    setLoading("google");
    try {
      await signIn("google", { callbackUrl });
      // signIn redirects on success — loading will persist until redirect
    } catch {
      setError("Google sign-in failed. Please try again.");
      setLoading(null);
    }
  }

  // ── Email / password ────────────────────────────────────────────────────────
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setLoading("email");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(null);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-field-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-1">
          <p className="font-serif text-2xl font-semibold text-field-100">Folio</p>
          <p className="text-sm text-field-500">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-2.5 text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={!!loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-field-700 bg-field-900 px-4 py-3 text-sm font-medium text-field-200 transition-colors hover:border-field-600 hover:bg-field-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-field-800" />
          <span className="text-xs text-field-600">or</span>
          <div className="h-px flex-1 bg-field-800" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs text-field-500">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full rounded-lg border border-field-700 bg-field-900 px-3 py-2.5 text-sm text-field-200",
                "placeholder:text-field-600 focus:outline-none focus:border-field-500 transition-colors"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-field-500">Password</label>
            <input
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "w-full rounded-lg border border-field-700 bg-field-900 px-3 py-2.5 text-sm text-field-200",
                "placeholder:text-field-600 focus:outline-none focus:border-field-500 transition-colors"
              )}
            />
          </div>

          <button
            type="submit"
            disabled={!!loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sage-400 py-3 text-sm font-medium text-field-950 transition-colors hover:bg-sage-300 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading === "email" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Toggle signin / signup */}
        <p className="text-center text-sm text-field-600">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            className="text-field-400 hover:text-field-200 transition-colors"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case "OAuthAccountNotLinked":
      return "This email is linked to a different sign-in method.";
    case "OAuthSignin":
    case "OAuthCallback":
      return "Google sign-in failed. Please try again.";
    case "CredentialsSignin":
      return "Invalid email or password.";
    default:
      return "Something went wrong. Please try again.";
  }
}
