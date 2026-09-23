"use client";
import { useEffect, useState } from "react";
const ROLES = ["Social Media Manager", "Graphic Artist", "Full-Stack Developer"];
export default function Hero() {
  const [text, setText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t); }, []);
  useEffect(() => {
    const current = ROLES[roleIndex];
    const speed = deleting ? 40 : 75;
    const pauseEnd = !deleting && text === current;
    const pauseStart = deleting && text === "";
    if (pauseEnd) { const t = setTimeout(() => setDeleting(true), 1600); return () => clearTimeout(t); }
    if (pauseStart) { const t = setTimeout(() => { setDeleting(false); setRoleIndex((i) => (i + 1) % ROLES.length); }, 450); return () => clearTimeout(t); }
    const t = setTimeout(() => {
      setText(current.slice(0, text.length + (deleting ? -1 : 1)));
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, roleIndex]);
  const rise = (d: string) => `transition-all duration-700 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${d}`;
  return (
    <section id="home" className="relative flex w-full justify-center overflow-hidden px-4 pt-32 pb-16 sm:px-6 sm:pt-36 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/30 via-fuchsia-400/25 to-cyan-300/30 blur-3xl dark:from-violet-600/20 dark:via-fuchsia-600/15 dark:to-cyan-500/15" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-600/10" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div className="relative grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className={rise("")}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-700 shadow backdrop-blur-xl backdrop-saturate-150 uppercase dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-200">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="h-2 w-2 rounded-full bg-emerald-500" /></span>
              Available for new opportunities
            </span>
          </p>
          <h1 className={`${rise("[transition-delay:100ms]")} mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight text-zinc-950 sm:text-5xl xl:text-6xl dark:text-white`}>
            Hi, I&apos;m <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-300">Rolly Paredes</span>
          </h1>
          <p className={`${rise("[transition-delay:200ms]")} mt-4 flex min-h-[2.5rem] items-center text-xl font-semibold text-zinc-800 sm:text-2xl dark:text-zinc-100`}>
            <span className="mr-2 font-normal text-zinc-500 dark:text-zinc-400">I&apos;m a</span>
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-300 dark:to-fuchsia-300">{text}</span>
            <span aria-hidden className="animate-caret ml-1 inline-block h-7 w-[3px] rounded bg-fuchsia-500" />
          </p>
          <p className={`${rise("[transition-delay:300ms]")} mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-400`}>
            I blend creativity with code — designing scroll-stopping visuals, growing engaged communities, and building fast, modern web experiences from concept to launch.
          </p>
          <div className={`${rise("[transition-delay:400ms]")} mt-8 flex flex-wrap items-center gap-3`}>
            <a href="#projects" className="inline-flex h-12 items-center rounded-full bg-zinc-900 px-7 text-sm font-semibold text-white shadow-xl shadow-zinc-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl dark:bg-white dark:text-zinc-900">View My Work</a>
            <a href="#contact" className="inline-flex h-12 items-center rounded-full border border-white/30 bg-white/10 px-7 text-sm font-semibold text-zinc-900 shadow backdrop-blur-xl backdrop-saturate-150 transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10">Get in Touch</a>
          </div>
          <dl className={`${rise("[transition-delay:500ms]")} mt-10 flex max-w-md items-stretch gap-3`}>
            {[{ v: "3+", l: "Roles, one creator" }, { v: "50+", l: "Projects delivered" }, { v: "100%", l: "Commitment" }].map((s) => (
              <div key={s.l} className="flex flex-1 flex-col rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 text-center shadow backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/[0.06]">
                <dt className="order-2 mt-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{s.l}</dt>
                <dd className="order-1 text-xl font-extrabold text-zinc-900 dark:text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={`${rise("[transition-delay:200ms]")} relative mx-auto w-full max-w-sm lg:max-w-none`}>
          <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-500/25 via-fuchsia-500/20 to-cyan-400/25 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/[0.06]">
            <div className="flex items-center gap-1.5 border-b border-white/20 px-5 py-3.5 dark:border-white/10">
              <span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">rolly-portfolio — preview</span>
            </div>
            <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 bg-zinc-950 p-8 text-center sm:aspect-square lg:aspect-[4/5]">
              <span className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-3xl font-black text-white shadow-2xl shadow-fuchsia-500/30 ring-1 ring-white/30">RP</span>
              <p className="font-mono text-sm text-zinc-400">Your photo goes here</p>
              <p className="max-w-[220px] text-xs leading-5 text-zinc-500">Replace this placeholder with your portrait image later.</p>
              <div className="flex gap-2">
                {["SM", "GD", "DEV"].map((t) => (
                  <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-zinc-300">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div><p className="text-sm font-bold text-zinc-900 dark:text-white">Rolly Paredes</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Social • Design • Code</p></div>
              <a href="#contact" className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-900">Hire Me</a>
            </div>
          </div>
          <div className="absolute -top-5 -right-3 animate-float rounded-2xl border border-white/30 bg-white/40 px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-lg backdrop-blur-xl sm:-right-6 dark:border-white/15 dark:bg-white/10 dark:text-white">Full-Stack Developer</div>
          <div className="absolute -bottom-5 -left-3 animate-float-delayed rounded-2xl border border-white/30 bg-white/40 px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-lg backdrop-blur-xl sm:-left-6 dark:border-white/15 dark:bg-white/10 dark:text-white">Graphic Artist</div>
        </div>
      </div>
    </section>
  );
}
