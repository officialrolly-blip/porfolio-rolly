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

const MUTE_KEY = "rolly-ai-muted";

function WavingBot({ size = "h-7 w-7" }: { size?: string }) {
  return (
    <span className={`${size} animate-wave`} role="img" aria-label="Waving robot assistant">
      🤖
    </span>
  );
}

type ReplyBlock =
  | { kind: "paragraph" | "heading"; key: string; text: string }
  | { kind: "list"; key: string; ordered: boolean; items: string[] }
  | { kind: "code"; key: string; language: string; text: string };

function parseReply(text: string): ReplyBlock[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReplyBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let orderedList = false;
  let codeLines: string[] | null = null;
  let codeLanguage = "";

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", key: `p-${blocks.length}`, text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ kind: "list", key: `l-${blocks.length}`, ordered: orderedList, items: listItems });
      listItems = [];
    }
  };
  const flushProse = () => {
    flushParagraph();
    flushList();
  };

  for (const line of lines) {
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      if (codeLines) {
        blocks.push({ kind: "code", key: `c-${blocks.length}`, language: codeLanguage, text: codeLines.join("\n") });
        codeLines = null;
        codeLanguage = "";
      } else {
        flushProse();
        codeLines = [];
        codeLanguage = fence[1].trim();
      }
      continue;
    }
    if (codeLines) {
      codeLines.push(line);
      continue;
    }
    if (!line.trim()) {
      flushProse();
      continue;
    }

    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushProse();
      blocks.push({ kind: "heading", key: `h-${blocks.length}`, text: heading[1] });
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      if (listItems.length && orderedList !== isOrdered) flushList();
      orderedList = isOrdered;
      listItems.push((unordered ?? ordered)![1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushProse();
  if (codeLines) {
    blocks.push({ kind: "code", key: `c-${blocks.length}`, language: codeLanguage, text: codeLines.join("\n") });
  }
  return blocks;
}

function ReplyInline({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s<]+)/g);
  return (
    <>
      {tokens.map((token, index) => {
        if (!token) return null;
        if (token.startsWith("**") && token.endsWith("**")) {
          return <strong key={index} className="font-bold text-zinc-900 dark:text-white">{token.slice(2, -2)}</strong>;
        }
        if (token.startsWith("`") && token.endsWith("`")) {
          return <code key={index} className="rounded-md border border-violet-200/70 bg-violet-100/70 px-1.5 py-0.5 font-mono text-[0.9em] text-violet-800 dark:border-violet-300/20 dark:bg-violet-400/10 dark:text-violet-200">{token.slice(1, -1)}</code>;
        }
        const markdownLink = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        const rawUrl = markdownLink ? null : token.match(/^https?:\/\/[^\s<]+$/)?.[0];
        const href = markdownLink?.[2] ?? rawUrl;
        if (href) {
          const label = markdownLink?.[1] ?? rawUrl;
          return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-fuchsia-700 dark:text-violet-300 dark:hover:text-fuchsia-300">{label}</a>;
        }
        return token;
      })}
    </>
  );
}

function AssistantReply({ text }: { text: string }) {
  const blocks = parseReply(text);
  return (
    <div className="w-full min-w-0 space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
      {blocks.map((block) => {
        if (block.kind === "code") {
          return (
            <div key={block.key} className="overflow-hidden rounded-xl border border-violet-200/80 bg-white/75 shadow-sm dark:border-white/10 dark:bg-black/20">
              <div className="border-b border-violet-100 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:border-white/10 dark:text-violet-200">
                {block.language || "Code"}
              </div>
              <pre className="max-w-full overflow-x-auto p-3 font-mono text-xs leading-5 text-zinc-800 dark:text-zinc-200"><code>{block.text}</code></pre>
            </div>
          );
        }
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={block.key} className={`space-y-1.5 pl-5 marker:text-fuchsia-500 ${block.ordered ? "list-decimal" : "list-disc"}`}>
              {block.items.map((item, index) => <li key={`${block.key}-${index}`} className="pl-0.5"><ReplyInline text={item} /></li>)}
            </List>
          );
        }
        if (block.kind === "heading") {
          return <h4 key={block.key} className="pt-1 text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white"><ReplyInline text={block.text} /></h4>;
        }
        return <p key={block.key} className="whitespace-pre-wrap"><ReplyInline text={block.text} /></p>;
      })}
    </div>
  );
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [muted, setMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [voiceError, setVoiceError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const voiceRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { setMuted(localStorage.getItem(MUTE_KEY) === "1"); } catch {}
  }, []);

  useEffect(() => () => {
    voiceRequestRef.current?.abort();
    audioRef.current?.pause();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  function stopVoice() {
    voiceRequestRef.current?.abort();
    voiceRequestRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setVoiceStatus("idle");
    setVoiceError("");
  }

  async function speak(text: string) {
    if (muted) return;
    stopVoice();
    const controller = new AbortController();
    voiceRequestRef.current = controller;
    setVoiceStatus("loading");
    setVoiceError("");
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Voice generation failed.");
      }
      const audioUrl = URL.createObjectURL(await res.blob());
      if (controller.signal.aborted) {
        URL.revokeObjectURL(audioUrl);
        return;
      }
      audioUrlRef.current = audioUrl;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      const releaseAudio = () => {
        if (audioRef.current === audio) audioRef.current = null;
        if (audioUrlRef.current === audioUrl) {
          URL.revokeObjectURL(audioUrl);
          audioUrlRef.current = null;
        }
        if (voiceRequestRef.current === controller) voiceRequestRef.current = null;
      };
      audio.onended = () => {
        releaseAudio();
        setVoiceStatus("idle");
      };
      audio.onerror = () => {
        if (audioRef.current !== audio) return;
        releaseAudio();
        setVoiceStatus("error");
        setVoiceError("Could not play the generated voice.");
      };
      await audio.play();
      if (voiceRequestRef.current === controller) setVoiceStatus("playing");
    } catch (err) {
      if (controller.signal.aborted) return;
      if (voiceRequestRef.current === controller) {
        audioRef.current?.pause();
        audioRef.current = null;
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
        voiceRequestRef.current = null;
      }
      setVoiceStatus("error");
      setVoiceError(err instanceof Error ? err.message : "Voice generation failed.");
    }
  }

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    try { localStorage.setItem(MUTE_KEY, next ? "1" : "0"); } catch {}
    if (next) stopVoice();
  };
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

  const dismissNudge = () => {
    setNudge(false);
    try { sessionStorage.setItem("rolly-ai-greeted", "1"); } catch {}
  };

  const openChat = () => {
    dismissNudge();
    setOpen(true);
  };

  // Auto-welcome: greet each visitor once per session with a pop-up bubble while the chat is closed.
  useEffect(() => {
    if (open) return;
    let alreadyGreeted = false;
    try { alreadyGreeted = sessionStorage.getItem("rolly-ai-greeted") === "1"; } catch {}
    if (alreadyGreeted) return;
    const show = setTimeout(() => setNudge(true), 4000);
    const hide = setTimeout(() => {
      setNudge(false);
      try { sessionStorage.setItem("rolly-ai-greeted", "1"); } catch {}
    }, 19000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [open]);

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
      void speak(data.reply);
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
        <>
          {nudge && (
            <button
              type="button"
              onClick={openChat}
              aria-label="Rolly AI welcome message — click to open chat"
              className="animate-chat-pop fixed bottom-24 right-5 z-[59] w-[min(300px,calc(100vw-2.5rem))] rounded-2xl rounded-br-md border border-white/25 bg-white/90 p-4 text-left shadow-2xl backdrop-blur-xl sm:right-6 dark:border-white/15 dark:bg-zinc-900/95"
            >
              <span className="block text-sm leading-6 font-semibold text-zinc-800 dark:text-zinc-100">
                👋 Hi there! I&apos;m Rolly AI — I can tell you about Rolly&apos;s services, skills, or how to hire him.
              </span>
              <span className="mt-1.5 block text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400">
                Click me to start chatting →
              </span>
              <span aria-hidden className="absolute -bottom-1.5 right-7 h-4 w-4 rotate-45 border-r border-b border-white/25 bg-white/90 dark:border-white/15 dark:bg-zinc-900/95" />
            </button>
          )}
          <button
          type="button"
          onClick={openChat}
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
        </>
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
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Turn voice on" : "Turn voice off"}
              title={muted ? "Voice off — click to enable" : voiceStatus === "error" ? voiceError : voiceStatus === "loading" ? "Generating voice..." : "Voice on — click to mute"}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-base leading-none transition hover:bg-white/30"
            >
              {muted ? "🔇" : voiceStatus === "loading" ? "…" : voiceStatus === "error" ? "⚠️" : voiceStatus === "playing" ? "🔉" : "🔊"}
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-lg leading-none text-white transition hover:bg-white/30">×</button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {voiceStatus === "error" && (
              <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
                Voice unavailable: {voiceError}
              </p>
            )}
            {messages.map((m, i) => (
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-3.5 py-2.5 text-sm leading-6 text-white shadow">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="min-w-0 max-w-full"><AssistantReply text={m.content} /></div>
                </div>
              )
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