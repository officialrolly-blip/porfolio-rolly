"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";
const links = [
  { label: "Home", href: "#home" },
  { label: "About Me", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact Me", href: "#contact" },
];
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
      <nav
        aria-label="Primary"
        className={`w-full max-w-5xl rounded-2xl border transition-all duration-500 ${
          scrolled
            ? "border-white/25 bg-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/[0.06]"
            : "border-white/20 bg-white/[0.07] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-lg backdrop-saturate-150 dark:border-white/10 dark:bg-black/20"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 sm:px-6">
          <a href="#home" onClick={() => { setActive("#home"); setOpen(false); }} className="group flex items-center gap-2.5">
            <span className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Logo size="md" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">Rolly Paredes</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">Portfolio</span>
            </span>
          </a>
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const on = active === l.href;
              if (l.label === "Contact Me") {
                return (
                  <li key={l.href}>
                    <a href={l.href} onClick={() => setActive(l.href)} className="ml-2 inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-900">
                      {l.label}
                    </a>
                  </li>
                );
              }
              return (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setActive(l.href)} className={`relative rounded-full px-4 py-2.5 text-sm font-medium transition ${on ? "text-zinc-950 dark:text-white" : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"}`}>
                    {on && <span className="absolute inset-0 rounded-full bg-white/60 shadow-sm ring-1 ring-white/60 backdrop-blur-md dark:bg-white/10 dark:ring-white/20" />}
                    <span className="relative">{l.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu" className="grid h-10 w-10 place-items-center rounded-xl border border-white/25 bg-white/20 text-zinc-800 backdrop-blur-md md:hidden dark:border-white/15 dark:bg-white/10 dark:text-white">
            <span className="relative block h-4 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-full rounded bg-current transition-all duration-300 ${open ? "top-[7px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-full rounded bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-full rounded bg-current transition-all duration-300 ${open ? "top-[7px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
        <div className={`grid overflow-hidden transition-all duration-500 md:hidden ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0">
            <ul className="space-y-1 border-t border-white/20 px-4 py-4 dark:border-white/10">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => { setActive(l.href); setOpen(false); }} className={`flex h-11 items-center rounded-xl px-4 text-sm font-medium transition ${l.label === "Contact Me" ? "justify-center bg-zinc-900 font-semibold text-white dark:bg-white dark:text-zinc-900" : active === l.href ? "bg-white/50 text-zinc-950 dark:bg-white/10 dark:text-white" : "text-zinc-600 hover:bg-white/30 dark:text-zinc-300"}`}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
