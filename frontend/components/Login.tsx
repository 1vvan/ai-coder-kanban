"use client";

import { useState } from "react";
import { login } from "@/lib/api";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    const ok = await login(username, password);
    setSubmitting(false);
    if (ok) {
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={submit}
        className="w-80 rounded-xl border border-border bg-surface p-6 shadow-sm"
      >
        <h1 className="mb-1 text-lg font-semibold text-foreground">Sign in</h1>
        <p className="mb-4 text-sm text-muted">Use user / password</p>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Username
          </span>
          <input
            aria-label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Password
          </span>
          <input
            type="password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        {error && (
          <p className="mb-3 text-sm text-danger">Invalid credentials</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
