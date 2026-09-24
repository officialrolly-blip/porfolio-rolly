"use client";
import { useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote: "Rolly took our socials from quiet to can't-miss. His content calendar and community playbook doubled our engagement in a single quarter.",
    name: "Maria Santos",
    role: "Small Business Owner",
    initials: "MS",
    grad: "from-emerald-400 to-cyan-500",
  },
  {
    quote: "The brand kit and social templates he designed gave us a look that's finally consistent — and unmistakably ours. Our posts get noticed now.",
    name: "James Cruz",
    role: "Marketing Lead",
    initials: "JC",
    grad: "from-violet-500 to-fuchsia-500",
  },
  {
    quote: "Fast, communicative, and genuinely skilled. Rolly shipped our site ahead of schedule and it looks great on every device we've tested.",
    name: "Ana Reyes",
    role: "Startup Founder",
    initials: "AR",
    grad: "from-cyan-400 to-violet-500",
  },
];

function Stars({ size }: { size: string }) {
  return (
    <span className="flex gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} aria-hidden viewBox="0 0 24 24" fill="currentColor" className={`${size} text-amber-400`}><path d="M12 2.5 14.9 8.6l6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5Z" /></svg>
      ))}
    </span>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);
  const rise = (d: string) => `transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${d}`;
  const t = TESTIMONIALS[active];
  return (
    <section id="testimonials" ref={ref} className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-300/20 via-fuchsia-400/20 to-violet-400/25 blur-3xl dark:from-cyan-500/10 dark:via-fuchsia-600/10 dark:to-violet-600/15" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p className={rise("")}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            Testimonials
          </span>
        </p>
        <h2 className={`${rise("[transition-delay:100ms]")} mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl dark:text-white`}>
          What clients <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">say about me</span>
        </h2>
        <p className={`${rise("[transition-delay:200ms]")} mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400`}>
          Real feedback from people I&apos;ve worked with across social media, design, and development.
        </p>
        <figure key={active} className={`${rise("[transition-delay:250ms]")} mt-10 animate-[fade-up_0.5s_ease-out_both] rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl backdrop-saturate-150 sm:p-10 dark:border-white/15 dark:bg-white/[0.06]`}>
          <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-fuchsia-500/60"><path d="M10 8c-3 1-5 3.5-5 7v1h6v-6H7.5C8 9 9 8.4 10 8.2V8Zm9 0c-3 1-5 3.5-5 7v1h6v-6h-3.5c.5-1 1.5-1.6 2.5-1.8V8Z" /></svg>
          <blockquote className="mt-4 text-lg leading-8 font-medium text-zinc-800 sm:text-xl sm:leading-9 dark:text-zinc-100">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-4">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${t.grad} text-sm font-black text-white shadow-lg ring-1 ring-white/30`}>{t.initials}</span>
            <span>
              <span className="block text-sm font-bold text-zinc-900 dark:text-white">{t.name}</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t.role}</span>
            </span>
            <span className="ml-auto"><Stars size="h-4 w-4" /></span>
          </figcaption>
        </figure>
        <div className={`${rise("[transition-delay:300ms]")} mt-6 flex items-center justify-center gap-4`}>
          <button type="button" onClick={() => setActive((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} aria-label="Previous testimonial" className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-zinc-700 shadow backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-200">←</button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((item, i) => (
              <button key={item.name} type="button" onClick={() => setActive(i)} aria-label={`Show testimonial from ${item.name}`} className={`h-2.5 rounded-full transition-all ${i === active ? "w-8 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500" : "w-2.5 bg-zinc-900/15 hover:bg-zinc-900/30 dark:bg-white/15 dark:hover:bg-white/30"}`} />
            ))}
          </div>
          <button type="button" onClick={() => setActive((active + 1) % TESTIMONIALS.length)} aria-label="Next testimonial" className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-zinc-700 shadow backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/20 dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-200">→</button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <button key={item.name} type="button" onClick={() => setActive(i)} className={`${rise(`[transition-delay:${350 + i * 100}ms]`)} group relative overflow-hidden rounded-3xl border p-6 text-left shadow backdrop-blur-xl backdrop-saturate-150 transition hover:-translate-y-1 hover:shadow-xl ${i === active ? "border-fuchsia-400/50 bg-white/20 dark:border-fuchsia-400/40 dark:bg-white/[0.1]" : "border-white/25 bg-white/10 dark:border-white/15 dark:bg-white/[0.06]"}`}>
              <Stars size="h-3.5 w-3.5" />
              <span className="mt-3 line-clamp-4 block text-sm leading-6 text-zinc-600 dark:text-zinc-300">&ldquo;{item.quote}&rdquo;</span>
              <span className="mt-4 flex items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${item.grad} text-xs font-black text-white shadow ring-1 ring-white/30`}>{item.initials}</span>
                <span>
                  <span className="block text-sm font-bold text-zinc-900 dark:text-white">{item.name}</span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">{item.role}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}