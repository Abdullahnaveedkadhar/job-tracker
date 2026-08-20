"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEMO_EMAIL, DEMO_PASSWORD, isDemoEnabled } from "@/lib/demo";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push("/profile");
          router.refresh();
          return;
        }

        setInfo(
          "Account created. Check your email to confirm your address, then sign in."
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const from = searchParams.get("from");
      router.push(from?.startsWith("/") ? from : "/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function signInAsDemo() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: demoError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (demoError) {
        setError("The demo account is unavailable right now.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="login-shell">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <Link href="/" className="btn-ghost text-sm">
          ← Back
        </Link>
      </div>
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <Link href={isLogin ? "/signup" : "/login"} className="btn-ghost text-sm">
          {isLogin ? "Create account" : "Sign in"}
        </Link>
      </div>

      <div className="card login-card">
        <h1 className="login-brand">Job Tracker</h1>
        <p className="login-tagline">
          {isLogin
            ? "Sign in to manage applications, your profile, and tailored CVs."
            : "Create an account to track applications and build tailored documents."}
        </p>

        {isLogin && isDemoEnabled ? (
          <div className="card-accent mt-6 space-y-3 p-4">
            <p className="text-sm text-secondary">
              Just looking around? Open a shared demo account with sample data —
              no registration.
            </p>
            <button
              type="button"
              onClick={signInAsDemo}
              disabled={loading}
              className="btn-primary w-full py-2"
            >
              {loading ? "Please wait…" : "Explore the demo"}
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="label">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-success" role="status">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5"
          >
            {loading
              ? "Please wait…"
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
