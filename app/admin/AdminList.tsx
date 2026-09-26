"use client";
import { TABS, type Category, type ProjectItem } from "./types";

export default function AdminList({ tab, visible, loading, load, remove }: {
  tab: Category; visible: ProjectItem[]; loading: boolean;
  load: () => void; remove: (id: string) => void;
}) {
  const activeTab = TABS.find((t) => t.id === tab)!;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold tracking-tight">
          {activeTab.label} <span className="text-zinc-400">({visible.length})</span>
        </h3>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold transition hover:bg-zinc-100 dark:border-white/15 dark:hover:bg-white/10"
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>
      {visible.length === 0 && (
        <p className="mt-4 rounded-2xl bg-zinc-100 p-5 text-sm text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
          No works in this tab yet — fill the form on the left and publish your first one.
        </p>
      )}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((p) => (
          <li
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-black/30"
          >
            {(p.imageUrl || p.thumbnailUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl ?? p.thumbnailUrl ?? ""}
                alt=""
                loading="lazy"
                className="h-32 w-full object-cover object-top"
              />
            )}
            <div className="flex flex-1 flex-col p-4">
              <p className="truncate text-sm font-extrabold">{p.title}</p>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {p.description || "No description yet."}
              </p>
              <p className="mt-2 truncate font-mono text-[11px] text-zinc-400">
                {(p.tags ?? []).join(" · ")}{p.url ? " · " + p.url : ""}
              </p>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="mt-3 h-9 rounded-full border border-rose-500/40 text-xs font-bold text-rose-500 transition hover:bg-rose-500 hover:text-white"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
