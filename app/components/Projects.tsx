"use client";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
type TabId = "social" | "design" | "dev";
type CardProps = { m: string; mCls: string; t: string; d: string; tags: string[]; top: ReactNode; link?: string | null };
function Card({ m, mCls, t, d, tags, top, link }: CardProps) {
  const inner = (
    <article className="flex animate-[fade-up_0.5s_ease-out_both] flex-col overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl dark:border-white/15 dark:bg-white/[0.06]">
      {top}
      <div className="flex flex-1 flex-col p-6">
        <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${mCls}`}>{m}</span>
        <h4 className="mt-3 font-bold text-zinc-900 dark:text-white">{t}</h4>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{d}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((g) => (
            <span key={g} className="rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200">{g}</span>
          ))}
        </div>
      </div>
    </article>
  );
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

type P = {
  id: string; category: TabId; title: string; description: string;
  tags: string[]; metric: string; imageUrl: string | null;
  url?: string | null; thumbnailUrl?: string | null;
};

function useProjects() {
  const [items, setItems] = useState<P[] | null>(null);
  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.projects) ? d.projects : []))
      .catch(() => setItems([]));
  }, []);
  return items;
}

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} loading="lazy" className="h-36 w-full object-cover object-top" />
);

// Full-stack thumbnail with resilient fallbacks:
// 1. saved local/remote thumbnail (repairs old broken encoded thum.io URLs)
// 2. live WordPress mShots of the project URL (yes — WordPress powers this, free, no key)
// 3. live thum.io of the project URL (raw URL, NOT encoded)
// 4. styled placeholder (never a broken image icon)
function DevThumb({ title, stored, pageUrl }: { title: string; stored: string | null; pageUrl?: string | null }) {
  const [step, setStep] = useState(0);
  const cleanStored = repairStored(stored);
  const candidates = [
    cleanStored,
    pageUrl ? `https://s0.wp.com/mshots/v1/${encodeURIComponent(pageUrl)}?w=1200` : null,
    pageUrl ? `https://image.thum.io/get/width/1200/crop/800/noanimate/${pageUrl}` : null,
  ].filter(Boolean) as string[];
  if (candidates.length === 0 || step >= candidates.length) {
    return (
      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-fuchsia-500/25 font-mono text-xs text-zinc-500">
        {title} · live preview
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[step]}
      alt={title + " front page"}
      loading="lazy"
      onError={() => setStep((s) => s + 1)}
      className="h-44 w-full object-cover object-top"
    />
  );
}

function repairStored(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const marker = "/noanimate/";
  if (stored.includes("image.thum.io") && stored.includes(marker) && stored.includes("%")) {
    try {
      const parts = stored.split(marker);
      const decoded = decodeURIComponent(parts[1] ?? "");
      if (/^https?:\/\//i.test(decoded)) return `${parts[0]}${marker}${decoded}`;
    } catch {
      return stored;
    }
  }
  return stored;
}

function SocialGrid({ items }: { items: P[] | null }) {
  const live = (items ?? []).filter((p) => p.category === "social");
  return (
    <div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Social Media Manager</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Campaigns that grow engaged communities and drive measurable results.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {items === null ? (
          <p className="text-sm text-zinc-500">Loading works…</p>
        ) : live.length === 0 ? (
          <p className="rounded-2xl border border-white/20 bg-white/40 p-5 text-sm text-zinc-500 dark:bg-white/5">No works yet — check back soon.</p>
        ) : (
          live.map((c) => (
            <Card key={c.id} m={c.metric || "New"} mCls="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" t={c.title} d={c.description} tags={c.tags} top={c.imageUrl ? <Img src={c.imageUrl} alt={c.title} /> : <div className="flex h-36 items-center justify-center bg-gradient-to-br from-violet-500/30 via-fuchsia-500/25 to-cyan-400/25 font-mono text-xs text-zinc-600 dark:text-zinc-300">SM preview image</div>} />
          ))
        )}
      </div>
    </div>
  );
}

function DesignGrid({ items }: { items: P[] | null }) {
  const live = (items ?? []).filter((p) => p.category === "design");
  return (
    <div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Graphic Design</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Visuals designed to stop the scroll and strengthen brand identity.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {items === null ? (
          <p className="text-sm text-zinc-500">Loading works…</p>
        ) : live.length === 0 ? (
          <p className="rounded-2xl border border-white/20 bg-white/40 p-5 text-sm text-zinc-500 dark:bg-white/5">No works yet — check back soon.</p>
        ) : (
          live.map((c) => (
            <Card key={c.id} m={c.metric || "New"} mCls="bg-violet-500/15 text-violet-600 dark:text-violet-300" t={c.title} d={c.description} tags={c.tags} top={c.imageUrl ? <Img src={c.imageUrl} alt={c.title} /> : <div className="flex h-36 items-center justify-center bg-zinc-950 font-mono text-xs text-zinc-400">Design preview image</div>} />
          ))
        )}
      </div>
    </div>
  );
}
function DevGrid({ items }: { items: P[] | null }) {
  const live = (items ?? []).filter((p) => p.category === "dev");
  // SAME card UI — only addition is the auto front-page thumbnail image on top
  const browserBar = (
    <div className="border-b border-white/20 px-5 py-3 dark:border-white/10">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 font-mono text-[11px] text-zinc-500">preview</span>
      </div>
    </div>
  );
  return (
    <div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Full-Stack Projects</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Web apps designed, built, and shipped end to end.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {items === null ? (
          <p className="text-sm text-zinc-500">Loading works…</p>
        ) : live.length === 0 ? (
          <p className="rounded-2xl border border-white/20 bg-white/40 p-5 text-sm text-zinc-500 dark:bg-white/5">No works yet — check back soon.</p>
        ) : (
          live.map((c) => (
            <Card
              key={c.id}
              m={c.metric || "Live"}
              mCls="bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
              t={c.title}
              d={c.description}
              tags={c.tags}
              link={c.url}
              top={
                <div>
                  {browserBar}
                  <DevThumb title={c.title} stored={c.thumbnailUrl ?? c.imageUrl} pageUrl={c.url} />
                </div>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
export default function Projects() {
  const ref = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState<TabId>("social");
  const items = useProjects();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  const rise = (d: string) => `transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${d}`;
  const tabs = [
    { id: "social" as TabId, tag: "SM", label: "Social Media" },
    { id: "design" as TabId, tag: "GD", label: "Graphic Design" },
    { id: "dev" as TabId, tag: "DEV", label: "Full-Stack" },
  ];
  return (
    <section id="projects" ref={ref} className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/25 via-fuchsia-400/20 to-cyan-300/25 blur-3xl dark:from-violet-600/15 dark:via-fuchsia-600/10 dark:to-cyan-500/10" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p className={rise("")}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            Projects
          </span>
        </p>
        <h2 className={`${rise("[transition-delay:100ms]")} mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl dark:text-white`}>
          Selected <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">work</span>
        </h2>
        <p className={`${rise("[transition-delay:200ms]")} mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400`}>
          Explore selected work across social media, design, and development — each project reflects real results and creative problem-solving.
        </p>
        <div className={`${rise("[transition-delay:250ms]")} mt-8 flex flex-wrap gap-2`}>
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`inline-flex h-11 items-center gap-2.5 rounded-full border px-4 text-sm font-semibold backdrop-blur-xl transition hover:-translate-y-0.5 ${tab === t.id ? "border-white/30 bg-zinc-900 text-white shadow-xl dark:bg-white dark:text-zinc-900" : "border-white/25 bg-white/10 text-zinc-700 shadow dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-200"}`}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 font-mono text-[10px] font-black text-white">{t.tag}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-10" key={tab}>
          {tab === "social" && <SocialGrid items={items} />}
          {tab === "design" && <DesignGrid items={items} />}
          {tab === "dev" && <DevGrid items={items} />}
        </div>
      </div>
    </section>
  );
}