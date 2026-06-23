"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { ShieldIcon } from "./icons";

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const errorParam = searchParams.get("error");
  const oauthError =
    errorParam === "google_not_configured"
      ? "Google sign-in isn't set up yet. Use email for now."
      : errorParam
        ? "Google sign-in failed. Please try again or use email."
        : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = isSignup
      ? await signUp(name, email, password)
      : await signIn(email, password);
    setPending(false);
    if (!res.ok) {
      setError(res.error || "Something went wrong. Please try again.");
      return;
    }
    router.push(next);
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] items-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-ink">
            {isSignup ? "Create your free account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {isSignup
              ? "Start learning in minutes. No card required to sign up."
              : "Log in to continue learning."}
          </p>

          {oauthError && (
            <p className="mt-4 rounded-[var(--radius)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {oauthError}
            </p>
          )}

          <a
            href={`/api/auth/google?next=${encodeURIComponent(next)}`}
            className="btn btn-outline mt-6 w-full gap-2.5"
          >
            <GoogleG /> Continue with Google
          </a>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Full name
                </label>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Nair"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Email
              </label>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                Password
              </label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            {error && (
              <p className="rounded-[var(--radius)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn btn-primary w-full">
              {pending
                ? isSignup
                  ? "Creating account…"
                  : "Logging in…"
                : isSignup
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldIcon width={14} height={14} /> Your password is encrypted. We never
            share your data.
          </p>

          <p className="mt-6 text-center text-sm text-muted">
            {isSignup ? "Already have an account? " : "New to Tech Courses? "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-semibold text-accent hover:underline"
            >
              {isSignup ? "Log in" : "Create one free"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
