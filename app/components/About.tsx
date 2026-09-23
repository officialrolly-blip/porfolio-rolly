"use client";
import { useEffect, useRef, useState } from "react";
const ROLES = [
  { tag: "SM", title: "Social Media Manager", desc: "I plan content calendars, grow engaged communities, and turn followers into loyal customers with data-driven strategies.", skills: ["Content Strategy", "Community", "Analytics"] },
  { tag: "GD", title: "Graphic Artist", desc: "I design scroll-stopping visuals — from branding and marketing creatives to social media graphics that match your identity.", skills: ["Branding", "Marketing Design", "Social Creatives"] },
  { tag: "DEV", title: "Full-Stack Developer", desc: "I build fast, responsive, and modern websites and web apps — from clean front-ends to reliable back-end systems.", skills: ["React / Next.js", "UI Engineering", "APIs"] },
];
const HIGHLIGHTS = ["Creative meets technical — design and code in one person", "Focused on results: engagement, conversions, and performance", "Clean communication and on-time delivery"];
export default function About() {
  const ref = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const rise = (d: string) => `transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${d}`;
  return (
    <section id="about" ref={ref} className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-300/25 via-fuchsia-400/20 to-violet-400/25 blur-3xl dark:from-cyan-500/10 dark:via-fuchsia-600/10 dark:to-violet-600/15" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p className={rise("")}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            About Me
          </span>
        </p>
        <div className="mt-5 grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <h2 className={`${rise("[transition-delay:100ms]")} text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl dark:text-white`}>
            Turning ideas into{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-300">engaging digital experiences</span>
          </h2>
          <p className={`${rise("[transition-delay:200ms]")} max-w-xl text-base leading-7 text-zinc-600 lg:justify-self-end dark:text-zinc-400`}>
            I&apos;m Rolly Paredes — a multi-disciplinary creator who manages social media, designs visuals, and develops full-stack web projects.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ROLES.map((r, i) => (
            <article key={r.title} className={`${rise(`[transition-delay:${300 + i * 100}ms]`)} group relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl backdrop-saturate-150 transition hover:-translate-y-1 hover:shadow-xl dark:border-white/15 dark:bg-white/[0.06]`}>
              <div aria-hidden className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-cyan-400/20 blur-2xl transition group-hover:scale-125" />
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 font-mono text-xs font-black text-white shadow-lg shadow-fuchsia-500/25 ring-1 ring-white/30">{r.tag}</span>
              <h3 className="relative mt-5 text-lg font-bold text-zinc-900 dark:text-white">{r.title}</h3>
              <p className="relative mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{r.desc}</p>
              <ul className="relative mt-4 flex flex-wrap gap-2">
                {r.skills.map((s) => (
                  <li key={s} className="rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[11px] font-semibold text-zinc-700 backdrop-blur-md dark:border-white/15 dark:bg-white/10 dark:text-zinc-200">{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`${rise("[transition-delay:400ms]")} rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl backdrop-saturate-150 sm:p-8 dark:border-white/15 dark:bg-white/[0.06]`}>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Why work with me?</h3>
            <ul className="mt-4 space-y-3">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-black text-white">✓</span>
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#projects" className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-900">See My Projects</a>
              <a href="#contact" className="inline-flex h-11 items-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-zinc-900 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/15 dark:bg-white/[0.06] dark:text-white">Let&apos;s Talk</a>
            </div>
          </div>
          <div className={`${rise("[transition-delay:500ms]")} rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl backdrop-saturate-150 sm:p-8 dark:border-white/15 dark:bg-white/[0.06]`}>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">My toolkit</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Tools I use to design, publish, and ship.</p>
            <div className="mt-5 space-y-4">
              {[["Design & Content", 90, "from-violet-500 via-fuchsia-500 to-cyan-400"], ["Social Media Growth", 85, "from-fuchsia-500 to-violet-500"], ["Web Development", 80, "from-cyan-400 to-violet-500"]].map(([label, pct, grad]) => (
                <div key={label as string}>
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300"><span>{label}</span><span>{pct}%</span></div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-900/10 dark:bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-1000`} style={{ width: show ? `${pct}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
