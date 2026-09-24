"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What services does Rolly offer?",
  "How can I hire Rolly?",
  "What tools does Rolly use?",
];

const GREETING: Msg = {
  role: "assistant",
  content: "👋 Hi! I'm Rolly AI — ask me anything about Rolly's services, skills, tools, or how to work with him!",
};

function WavingBot({ size = "h-7 w-7" }: { size?: string }) {
  return (
    <span className={`${size} animate-wave`} role="img" aria-label="Waving robot assistant">
      🤖
    </span>
  );
}
export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || sending) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "auto",
          messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error ?? "Send failed");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sorry, something went wrong.";
      setMessages([...next, { role: "assistant", content: msg }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat with Rolly AI"
          className="group fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6"
        >
          <span className="relative grid h-16 w-16 place-items-center transition-transform duration-300 group-hover:scale-110">
            <span className="grid h-full w-full place-items-center text-4xl drop-shadow-lg">
              <WavingBot size="h-10 w-10" />
            </span>
          </span>
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 rounded-full border border-white/25 bg-white/80 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-zinc-800 opacity-0 shadow-lg backdrop-blur-xl transition group-hover:opacity-100 sm:block dark:border-white/15 dark:bg-zinc-900/90 dark:text-zinc-100">
            Chat with Rolly AI
          </span>
        </button>
      )}

      {open && (
        <div className="animate-chat-pop fixed bottom-5 right-5 z-[60] flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-white/25 bg-white/80 shadow-2xl backdrop-blur-2xl sm:bottom-6 sm:right-6 dark:border-white/15 dark:bg-zinc-950/90" role="dialog" aria-label="Chat with Rolly AI">
          <div className="flex items-center gap-3 border-b border-zinc-900/10 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3.5 dark:border-white/10">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/20 text-xl ring-1 ring-white/40">
              <WavingBot size="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                Rolly AI
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                </span>
              </span>
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-lg leading-none text-white transition hover:bg-white/30">×</button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${m.role === "user" ? "rounded-br-md bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white shadow" : "rounded-bl-md border border-zinc-900/10 bg-white/70 text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-zinc-900/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/10" aria-label="Rolly AI is typing">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="animate-typing-dot h-2 w-2 rounded-full bg-fuchsia-500" style={{ animationDelay: `${d * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {messages.length <= 2 && !sending && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-700 transition hover:bg-fuchsia-500/20 dark:text-fuchsia-300">
                  {s}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-zinc-900/10 p-3 dark:border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Rolly..."
              aria-label="Type your message"
              className="h-11 flex-1 rounded-full border border-zinc-900/10 bg-white/70 px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30 dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white shadow-lg transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="h-5 w-5"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}