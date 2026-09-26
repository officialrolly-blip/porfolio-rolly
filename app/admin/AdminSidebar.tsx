"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", icon: "◈", exact: true },
  { href: "/admin?tab=social", label: "Social Media", icon: "SM", exact: false },
  { href: "/admin?tab=design", label: "Graphic Design", icon: "GD", exact: false },
  { href: "/admin?tab=dev", label: "Full-Stack", icon: "DEV", exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    sessionStorage.removeItem("admin-key");
    router.push("/admin/login");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-950/5 md:flex dark:border-white/10 dark:bg-zinc-950">
        <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-sm font-black text-white shadow-lg ring-1 ring-white/30">
            RP
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-extrabold tracking-tight">Admin Panel</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Rolly Paredes
            </span>
          </span>
        </Link>

        <p className="mt-6 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          Manage works
        </p>
        <nav className="mt-2 flex flex-col gap-1 text-sm font-semibold">
          {LINKS.map((l) => {
            const active =
              typeof window !== "undefined"
                ? l.exact
                  ? window.location.pathname === "/admin" && !window.location.search
                  : window.location.pathname + window.location.search === l.href
                : pathname === "/admin";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "flex items-center gap-3 rounded-2xl px-3 py-3 transition " +
                  (active
                    ? "bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10")
                }
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 font-mono text-[10px] font-black text-white">
                  {l.icon}
                </span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-5 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
            Post works here — they appear instantly in the “Selected work” section.
          </div>
          <Link
            href="/#projects"
            className="flex h-11 items-center justify-center rounded-full border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-100 dark:border-white/15 dark:hover:bg-white/10"
          >
            ← View website
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-zinc-900"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex gap-2 overflow-x-auto border-t border-zinc-200 bg-white/90 p-3 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-black/90">
        <MobileLink href="/admin" label="Overview" />
        <MobileLink href="/admin?tab=social" label="Social" />
        <MobileLink href="/admin?tab=design" label="Design" />
        <MobileLink href="/admin?tab=dev" label="Full-Stack" />
        <MobileLink href="/#projects" label="← Site" />
      </nav>
    </>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold dark:border-white/15 dark:bg-white/10"
    >
      {label}
    </Link>
  );
}
