"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TABS, type Category, type ProjectItem } from "./types";
import AdminForm from "./AdminForm";
import AdminList from "./AdminList";

export const dynamic = "force-dynamic";

function AdminInner() {
  const search = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<Category>("social");
  const [password, setPassword] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const t = search.get("tab");
    if (t === "social" || t === "design" || t === "dev") setTab(t);
  }, [search]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-key") ?? "";
    if (!saved) { router.replace("/admin/login?next=/admin"); return; }
    setPassword(saved);
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch { setNotice("Could not load projects."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm("Delete this work?")) return;
    try {
      const res = await fetch("/api/projects?id=" + id, {
        method: "DELETE",
        headers: { "x-admin-password": password ?? "" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      setProjects((p) => p.filter((x) => x.id !== id));
      setNotice("Deleted.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Delete failed."); }
  }

  if (password === null) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <p className="animate-pulse text-sm text-zinc-500">Checking session…</p>
      </div>
    );
  }
  const visible = projects.filter((p) => p.category === tab);
  const counts = {
    social: projects.filter((p) => p.category === "social").length,
    design: projects.filter((p) => p.category === "design").length,
    dev: projects.filter((p) => p.category === "dev").length,
  };
  const activeTab = TABS.find((t) => t.id === tab)!;
  return (
    <div>
      <header className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl sm:p-8 dark:border-white/10 dark:bg-zinc-950">
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Manage your{" "}
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">works</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Post below and it appears on the main page instantly. AI writes the description — you review, then publish.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={"inline-flex h-12 items-center gap-2.5 rounded-full border px-4 text-sm font-bold transition hover:-translate-y-0.5 " + (tab === t.id ? "border-zinc-900 bg-zinc-900 text-white shadow-xl dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200")}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 font-mono text-[10px] font-black text-white">{t.tag}</span>
              {t.label}
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] dark:bg-white/15">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs font-medium text-zinc-500">{activeTab.hint}</p>
      </header>
      {notice && (<p className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium shadow dark:border-white/10 dark:bg-zinc-950">{notice}</p>)}
      {aiError && (
        <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-6">
          <p className="font-bold text-amber-700 dark:text-amber-300">AI needs attention</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-300">{aiError}</p>
          <p className="mt-1 text-xs text-zinc-500">Fix: add OPENROUTER_API_KEY to .env.local (and Vercel env vars), then restart. You can still write manually and publish.</p>
        </div>
      )}
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl sm:p-7 dark:border-white/10 dark:bg-zinc-950">
          <Step n="1" title={tab === "dev" ? "Project details" : "Title + image"} />
          <AdminForm tab={tab} password={password} setNotice={setNotice} setAiError={setAiError} onPublished={(p) => setProjects((x) => [p, ...x])} />
        </section>
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl sm:p-7 dark:border-white/10 dark:bg-zinc-950">
          <Step n="2" title="Review + publish" />
          <AdminList tab={tab} visible={visible} loading={loading} load={load} remove={remove} />
        </section>
      </div>
    </div>
  );
}

function Step({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-sm font-black text-white dark:bg-white dark:text-zinc-900">{n}</span>
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading admin…</p>}>
      <AdminInner />
    </Suspense>
  );
}

        <p className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-zinc-900">
          Admin · Selected work
        </p>
