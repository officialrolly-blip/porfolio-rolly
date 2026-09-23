"use client";
import { useEffect, useRef, useState } from "react";
import { FiFilm } from "react-icons/fi";
import {
  SiAdobeillustrator,
  SiAdobephotoshop,
  SiCanva,
  SiFigma,
  SiFirebase,
  SiGit,
  SiGithub,
  SiMeta,
  SiNextdotjs,
  SiNotion,
  SiOpenai,
  SiReact,
  SiTailwindcss,
  SiTrello,
  SiTypescript,
  SiVercel,
  SiVisualstudiocode,
  SiWordpress,
} from "react-icons/si";
import type { IconType } from "react-icons";
const GROUPS = [
  { tag: "SM", title: "Social Media Management", grad: "from-emerald-400 to-cyan-500" },
  { tag: "GD", title: "Graphic Design", grad: "from-violet-500 to-fuchsia-500" },
  { tag: "DEV", title: "Full-Stack Development", grad: "from-cyan-400 to-violet-500" },
];
const LEVELS: Record<string, { n: string; p: number }[]> = {
  SM: [{ n: "Content Strategy & Calendars", p: 92 }, { n: "Community Engagement", p: 88 }, { n: "Analytics & Reporting", p: 85 }, { n: "Campaign Planning", p: 90 }],
  GD: [{ n: "Branding & Identity", p: 88 }, { n: "Social Media Creatives", p: 94 }, { n: "Marketing Materials", p: 86 }, { n: "Layout & Typography", p: 84 }],
  DEV: [{ n: "React / Next.js", p: 85 }, { n: "HTML, CSS & Tailwind", p: 90 }, { n: "JavaScript / TypeScript", p: 82 }, { n: "APIs & Databases", p: 78 }],
};
const TOOLS: { name: string; category: string; Icon: IconType; color: string }[] = [
  { name: "Meta Business Suite", category: "Social · Publish", Icon: SiMeta, color: "#0082FB" },
  { name: "Canva", category: "Design", Icon: SiCanva, color: "#00C4CC" },
  { name: "Photoshop", category: "Design", Icon: SiAdobephotoshop, color: "#31A8FF" },
  { name: "Illustrator", category: "Design", Icon: SiAdobeillustrator, color: "#FF9A00" },
  { name: "CapCut", category: "Video", Icon: FiFilm, color: "#000000" },
  { name: "Notion", category: "Organize", Icon: SiNotion, color: "#000000" },
  { name: "VS Code", category: "Develop", Icon: SiVisualstudiocode, color: "#007ACC" },
  { name: "React", category: "Develop", Icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", category: "Develop", Icon: SiNextdotjs, color: "#000000" },
  { name: "Tailwind CSS", category: "Develop", Icon: SiTailwindcss, color: "#06B6D4" },
  { name: "TypeScript", category: "Develop", Icon: SiTypescript, color: "#3178C6" },
  { name: "Git", category: "Develop", Icon: SiGit, color: "#F05032" },
  { name: "GitHub", category: "Develop", Icon: SiGithub, color: "#181717" },
  { name: "Vercel", category: "Deploy", Icon: SiVercel, color: "#000000" },
  { name: "Figma", category: "Design", Icon: SiFigma, color: "#F24E1E" },
  { name: "Trello", category: "Organize", Icon: SiTrello, color: "#0052CC" },
  { name: "ChatGPT", category: "AI Workflow", Icon: SiOpenai, color: "#10A37F" },
  { name: "Firebase", category: "Backend", Icon: SiFirebase, color: "#DD2C00" },
  { name: "WordPress", category: "Publish", Icon: SiWordpress, color: "#21759B" },
];
export default function Skills() {
  const ref = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  const rise = (d: string) => `transition-all duration-700 ease-out ${show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${d}`;
  return (
    <section id="skills" ref={ref} className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-400/20 via-violet-400/25 to-cyan-300/25 blur-3xl dark:from-fuchsia-600/10 dark:via-violet-600/15 dark:to-cyan-500/10" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p className={rise("")}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            Skills and Tools
          </span>
        </p>
        <h2 className={`${rise("[transition-delay:100ms]")} mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl dark:text-white`}>
          What I <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">bring to the table</span>
        </h2>
        <p className={`${rise("[transition-delay:200ms]")} mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400`}>
          Three crafts, one workflow — the skills I use to grow audiences, design on-brand visuals, and ship production-ready websites.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {GROUPS.map((g, i) => (
            <article key={g.tag} className={`${rise(`[transition-delay:${250 + i * 100}ms]`)} relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl sm:p-7 dark:border-white/15 dark:bg-white/[0.06]`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${g.grad} font-mono text-xs font-black text-white shadow-lg ring-1 ring-white/30`}>{g.tag}</span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{g.title}</h3>
              </div>
              <div className="mt-6 space-y-4">
                {LEVELS[g.tag].map((s) => (
                  <div key={s.n}>
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300"><span>{s.n}</span><span>{s.p}%</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-900/10 dark:bg-white/10">
                      <div className={`h-full rounded-full bg-gradient-to-r ${g.grad} transition-all duration-1000`} style={{ width: show ? `${s.p}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className={`${rise("[transition-delay:500ms]")} mt-5 rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl sm:p-8 dark:border-white/15 dark:bg-white/[0.06]`}>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Tools I work with</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">My day-to-day stack for content, design, and development.</p>
          <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {TOOLS.map(({ name, category, Icon, color }) => (
              <li
                key={name}
                title={`${name} — ${category}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-white/25 bg-white/20 px-3 py-4 text-center transition hover:-translate-y-1 hover:bg-white/30 hover:shadow-lg dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/[0.14]"
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition group-hover:scale-110 dark:bg-white/[0.12] dark:ring-white/10"
                >
                  <Icon size={22} color={color} aria-label={`${name} logo`} className="dark:brightness-[1.7] dark:contrast-[1.05]" />
                </span>
                <span className="text-xs font-bold leading-tight text-zinc-800 dark:text-zinc-100">{name}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{category}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
