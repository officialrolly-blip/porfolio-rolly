"use client";

import { useEffect, useRef, useState } from "react";

const WELCOME_TEXT =
  "Hi there! Welcome to my personal portfolio. I'm Rolly Paredes. Thanks for visiting. Feel free to explore my work, skills, and projects.";
const WELCOME_SESSION_KEY = "rolly-portfolio-welcome-played";

type Status = "loading" | "playing" | "blocked" | "error";

export default function WelcomeVoice() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [audioReady, setAudioReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(WELCOME_SESSION_KEY) === "1") return;
    } catch {
      // Session storage may be unavailable; still try to play the welcome.
    }

    const controller = new AbortController();
    requestRef.current = controller;

    async function prepareAndPlay() {
      try {
        const response = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: WELCOME_TEXT }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(typeof data.error === "string" ? data.error : "Welcome voice is unavailable.");
        }

        const audioUrl = URL.createObjectURL(await response.blob());
        if (controller.signal.aborted) {
          URL.revokeObjectURL(audioUrl);
          return;
        }
        audioUrlRef.current = audioUrl;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => {
          if (audioRef.current !== audio) return;
          audioRef.current = null;
          if (audioUrlRef.current === audioUrl) {
            URL.revokeObjectURL(audioUrl);
            audioUrlRef.current = null;
          }
          try { sessionStorage.setItem(WELCOME_SESSION_KEY, "1"); } catch {}
          setDismissed(true);
        };
        audio.onerror = () => {
          if (audioRef.current !== audio) return;
          setError("The welcome audio could not be played.");
          setStatus("error");
        };
        setAudioReady(true);

        try {
          await audio.play();
          setStatus("playing");
        } catch (playError) {
          if (playError instanceof Error && playError.name === "NotAllowedError") {
            setStatus("blocked");
            return;
          }
          throw playError;
        }
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(requestError instanceof Error ? requestError.message : "Welcome voice is unavailable.");
        setStatus("error");
      }
    }

    void prepareAndPlay();
    return () => {
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    };
  }, []);

  async function playWelcome() {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    try {
      await audio.play();
      setStatus("playing");
    } catch (playError) {
      setError(playError instanceof Error ? playError.message : "Could not play the welcome audio.");
      setStatus("error");
    }
  }

  if ((status !== "blocked" && status !== "error") || dismissed) return null;

  return (
    <div className="animate-chat-pop fixed bottom-5 left-5 z-[58] flex max-w-[min(340px,calc(100vw-2.5rem))] items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 text-zinc-800 shadow-xl shadow-violet-500/10 backdrop-blur-2xl sm:bottom-6 sm:left-6">
      <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-white">✦</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-zinc-800">Welcome to my personal portfolio</p>
        <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">
          {status === "blocked" ? "Tap to hear my welcome." : error}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void playWelcome()}
        disabled={!audioReady}
        aria-label="Play portfolio welcome voice"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ▶
      </button>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try { sessionStorage.setItem(WELCOME_SESSION_KEY, "1"); } catch {}
        }}
        aria-label="Dismiss welcome message"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-lg text-zinc-500 transition hover:bg-white/80 hover:text-zinc-900"
      >
        ×
      </button>
    </div>
  );
}
