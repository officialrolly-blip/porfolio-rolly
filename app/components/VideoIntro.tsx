// Video Introduction — video on the left, generated text on the right.
// Fetches the latest published "video" project; falls back to a friendly
// placeholder until one exists.
"use client";
import { useEffect, useRef, useState } from "react";

type Intro = {
  id: string; title: string; description: string; tags: string[];
  videoUrl?: string | null; thumbnailUrl?: string | null;
};

export default function VideoIntro() {
  const ref = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  const [intro, setIntro] = useState<Intro | null | undefined>(undefined);
  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const all = Array.isArray(d.projects) ? d.projects : [];
        const latest = all.find((p: Intro & { category?: string }) => p.category === "video" && (p as Intro).videoUrl) as Intro | undefined;
        setIntro(latest ?? null);
      })
      .catch(() => setIntro(null));
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); o.disconnect(); } }, { threshold: 0.15 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  const rise = (d: string) => `transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${d}`;
  return (
    <section id="video-intro" ref={ref} className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-400/25 via-violet-400/20 to-cyan-300/25 blur-3xl dark:from-fuchsia-600/15 dark:via-violet-600/10 dark:to-cyan-500/10" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p className={rise("")}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            Video Introduction
          </span>
        </p>
        <div className="mt-5 grid items-center gap-6 lg:grid-cols-2">
          <div className={`${rise("[transition-delay:100ms]")} relative overflow-hidden rounded-3xl border border-white/25 bg-black/90 shadow backdrop-blur-xl dark:border-white/15`}>
            {intro?.videoUrl ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video key={intro.id} src={intro.videoUrl} poster={intro.thumbnailUrl ?? undefined} controls preload="metadata" playsInline className="aspect-video w-full object-contain" />
            ) : (
              <div className="grid aspect-video w-full place-items-center bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-cyan-400/20 p-8 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {intro === undefined ? "Loading intro…" : "No intro video yet — publish one from the Video Intro tab in admin."}
              </div>
            )}
          </div>
          <div className={rise("[transition-delay:200ms]")}>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              {intro?.title || "Meet me in 60 seconds"}
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {intro?.description || "Press play to watch a quick introduction — who I am, what I do across social media, design, and development, and how I can help your brand grow."}
            </p>
            {intro && intro.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {intro.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200">{t}</span>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#about" className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-900">More About Me</a>
              <a href="#contact" className="inline-flex h-11 items-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-zinc-900 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/15 dark:bg-white/[0.06] dark:text-white">Let&apos;s Talk</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
