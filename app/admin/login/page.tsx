"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = search.get("next") || "/admin";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError("Enter your admin password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Login failed.");
      sessionStorage.setItem("admin-key", password.trim());
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center">
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-2xl shadow-zinc-950/10 sm:p-10 dark:border-white/10 dark:bg-zinc-950">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-base font-black text-white shadow-lg ring-1 ring-white/30">
            RP
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight">Admin Login</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Rolly Paredes Portfolio
            </span>
          </span>
        </Link>

        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
            Admin
          </span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Enter your admin password to manage Social Media, Graphic Design, and Full-Stack works.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              Admin password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
              className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-fuchsia-400 focus:bg-white dark:border-white/15 dark:bg-black/40 dark:focus:bg-black"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-12 w-full rounded-full bg-zinc-900 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-white dark:text-zinc-900"
          >
            {busy ? "Checking…" : "Log in →"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs font-semibold">
          <Link href="/" className="text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white">
            ← Back to website
          </Link>
          <span className="text-zinc-400">Set via ADMIN_PASSWORD</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading…</p>}>
      <LoginInner />
    </Suspense>
  );
}
