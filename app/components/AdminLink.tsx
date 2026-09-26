import Link from "next/link";

export default function AdminLink() {
  return (
    <Link
      href="/admin"
      className="fixed bottom-5 left-5 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-white/70 px-4 text-xs font-bold text-zinc-700 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200"
      title="Open admin panel"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 font-mono text-[9px] font-black text-white">
        AD
      </span>
      Admin
    </Link>
  );
}
