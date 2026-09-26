"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  // Login page: centered card, NO sidebar / bottom nav.
  if (isLogin) {
    return (
      <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 antialiased dark:bg-black dark:text-white">
        <div aria-hidden className="pointer-events-none fixed inset-0">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/25 via-fuchsia-400/20 to-cyan-300/25 blur-3xl dark:from-violet-600/15 dark:via-fuchsia-600/10 dark:to-cyan-500/10" />
        </div>
        <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 antialiased dark:bg-black dark:text-white">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/25 via-fuchsia-400/20 to-cyan-300/25 blur-3xl dark:from-violet-600/15 dark:via-fuchsia-600/10 dark:to-cyan-500/10" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <AdminSidebar />
        <main className="min-w-0 flex-1 pb-24 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
