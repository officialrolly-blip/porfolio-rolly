"use client";
import { useEffect, useRef, useState } from "react";
import { AuiProvider, AuiConfig } from "@assistant-ui/store";

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
          return <strong key={index} className="font-bold text-zinc-900">{token.slice(2, -2)}</strong>;
        }
        if (token.startsWith("`") && token.endsWith("`")) {
          return <code key={index} className="rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 font-mono text-[0.9em] text-violet-800">{token.slice(1, -1)}</code>;
        }
        const markdownLink = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        const rawUrl = markdownLink ? null : token.match(/^https?:\/\/[^\s<]+$/)?.[0];
        const href = markdownLink?.[2] ?? rawUrl;
        if (href) {
          const label = markdownLink?.[1] ?? rawUrl;
          return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900">{label}</a>;
        }
        return token;
      })}
    </>
  );
}

function AssistantReply({ text }: { text: string }) {
  const blocks = parseReply(text);
  return (
    <div className="w-full min-w-0 space-y-3 text-sm leading-6 text-zinc-700">
      {blocks.map((block) => {
        if (block.kind === "code") {
          return (
            <div key={block.key} className="overflow-hidden rounded-xl border border-violet-200/70 bg-white/60 shadow-sm backdrop-blur-md">
              <div className="border-b border-violet-100 bg-violet-100/60 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-violet-700">
                {block.language || "Code"}
              </div>
              <pre className="max-w-full overflow-x-auto p-3 font-mono text-xs leading-5 text-zinc-800"><code>{block.text}</code></pre>
            </div>
          );
        }
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={block.key} className={`space-y-1.5 pl-5 marker:text-violet-400 ${block.ordered ? "list-decimal" : "list-disc"}`}>
              {block.items.map((item, index) => <li key={`${block.key}-${index}`} className="pl-0.5"><ReplyInline text={item} /></li>)}
            </List>
          );
        }
        if (block.kind === "heading") {
          return <h4 key={block.key} className="pt-1 text-sm font-extrabold tracking-tight text-zinc-900"><ReplyInline text={block.text} /></h4>;
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
    const userMsg = { role: "user" as const, content: clean };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    let assistantContent = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/plain" },
        body: JSON.stringify({
          model: "auto",
          stream: true,
          messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Send failed");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body.");
      const decoder = new TextDecoder();
      setMessages([...next, { role: "assistant", content: "" }]);
      let lastUpdate = 0;
      const flush = () => {
        setMessages([...next, { role: "assistant", content: assistantContent }]);
      };
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        const now = Date.now();
        if (now - lastUpdate > 40) {
          lastUpdate = now;
          flush();
        }
      }
      flush();
      void speak(assistantContent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sorry, something went wrong.";
      setMessages([...next, { role: "assistant", content: msg }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <AuiProvider config={AuiConfig({})}>
      {!open && (
        <>
          {nudge && (
            <button
              type="button"
              onClick={openChat}
              aria-label="Rolly AI welcome message — click to open chat"
              className="animate-chat-pop fixed bottom-24 right-5 z-[59] w-[min(300px,calc(100vw-2.5rem))] rounded-2xl rounded-br-md border border-white/70 bg-white/65 p-4 text-left shadow-2xl shadow-violet-950/10 backdrop-blur-2xl sm:right-6"
            >
              <span className="block text-sm leading-6 font-semibold text-zinc-800">
                👋 Hi there! I&apos;m Rolly AI — I can tell you about Rolly&apos;s services, skills, or how to hire him.
              </span>
              <span className="mt-1.5 block text-xs font-semibold text-violet-700">
                Click me to start chatting →
              </span>
              <span aria-hidden className="absolute -bottom-1.5 right-7 h-4 w-4 rotate-45 border-r border-b border-white/70 bg-white/65" />
            </button>
          )}
          <button
          type="button"
          onClick={openChat}
          aria-label="Open chat with Rolly AI"
          className="group fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6"
        >
          <span className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/80 bg-violet-100/75 text-violet-900 shadow-xl shadow-violet-300/30 ring-1 ring-white/60 backdrop-blur-xl transition duration-300 group-hover:scale-105 group-hover:bg-violet-100">
            <span className="grid h-full w-full place-items-center text-4xl drop-shadow-lg">
              <WavingBot size="h-10 w-10" />
            </span>
            <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-violet-300" />
          </span>
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-zinc-800 opacity-0 shadow-lg backdrop-blur-2xl transition group-hover:opacity-100 sm:block">
            Chat with Rolly AI
          </span>
          </button>
        </>
      )}

      {open && (
        <div className="animate-chat-pop fixed bottom-5 right-5 z-[60] flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/65 text-zinc-800 shadow-2xl shadow-violet-950/15 ring-1 ring-white/30 backdrop-blur-2xl sm:bottom-6 sm:right-6" role="dialog" aria-label="Chat with Rolly AI">
          <div className="flex items-center gap-3 border-b border-violet-200/70 bg-violet-100/55 px-4 py-3.5 text-violet-950 backdrop-blur-xl">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/80 bg-white/55 text-xl shadow-inner ring-1 ring-violet-200/60">
              <WavingBot size="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-bold tracking-wide text-violet-950">
                Rolly AI
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-violet-300 opacity-75" />
                  <span className="h-2 w-2 rounded-full bg-violet-300" />
                </span>
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-violet-700">AI assistant</span>
            </span>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Turn voice on" : "Turn voice off"}
              title={muted ? "Voice off — click to enable" : voiceStatus === "error" ? voiceError : voiceStatus === "loading" ? "Generating voice..." : "Voice on — click to mute"}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/55 text-base leading-none transition hover:bg-white/80"
            >
              {muted ? "🔇" : voiceStatus === "loading" ? "…" : voiceStatus === "error" ? "⚠️" : voiceStatus === "playing" ? "🔉" : "🔊"}
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/55 text-lg leading-none text-violet-950 transition hover:bg-white/80">×</button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {voiceStatus === "error" && (
              <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-50/80 px-3 py-2 text-xs leading-5 text-amber-800">
                Voice unavailable: {voiceError}
              </p>
            )}
            {messages.map((m, i) => (
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md border border-violet-200/80 bg-violet-100/80 px-3.5 py-2.5 text-sm leading-6 text-violet-950 shadow-lg shadow-violet-300/15 backdrop-blur-md">
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
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/70 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-md" aria-label="Rolly AI is typing">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="animate-typing-dot h-2 w-2 rounded-full bg-violet-300" style={{ animationDelay: `${d * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {messages.length <= 2 && !sending && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-violet-200 bg-violet-50/75 px-3 py-1.5 text-xs font-semibold text-violet-800 shadow-sm backdrop-blur-md transition hover:border-violet-300 hover:bg-violet-100">
                  {s}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-white/70 bg-white/40 p-3 backdrop-blur-xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Rolly..."
              aria-label="Type your message"
              className="h-11 flex-1 rounded-full border border-white/80 bg-white/70 px-4 text-sm text-zinc-900 shadow-inner shadow-violet-950/5 outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-200/60"
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-violet-200 bg-violet-100 text-violet-800 shadow-lg shadow-violet-300/20 transition hover:scale-105 hover:bg-violet-200 disabled:opacity-50 disabled:hover:scale-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="h-5 w-5"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
            </button>
          </form>
        </div>
      )}
    </AuiProvider>
  );
}