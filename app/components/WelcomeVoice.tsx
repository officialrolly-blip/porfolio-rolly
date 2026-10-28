"use client";

import { useEffect, useRef } from "react";

const WELCOME_TEXT =
  "Welcome to my personal portfolio.";
const WELCOME_SESSION_KEY = "rolly-portfolio-welcome-played";

export default function WelcomeVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const playAttemptRef = useRef(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(WELCOME_SESSION_KEY) === "1") return;
    } catch {
      // Session storage may be unavailable; still try to play the welcome.
    }

    async function playWelcome() {
      const audio = audioRef.current;
      if (!audio || !audio.paused || playAttemptRef.current) return;

      playAttemptRef.current = true;
      try {
        await audio.play();
      } catch (playError) {
        if (!(playError instanceof Error && playError.name === "NotAllowedError")) {
          console.error("[welcome-voice] Could not play the welcome audio.", playError);
        }
      } finally {
        playAttemptRef.current = false;
      }
    }

    const onUserInteraction = () => {
      void playWelcome();
    };
    window.addEventListener("pointerdown", onUserInteraction);
    window.addEventListener("keydown", onUserInteraction);

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
        };
        audio.onerror = () => {
          if (audioRef.current !== audio) return;
          console.error("[welcome-voice] The welcome audio could not be played.");
        };
        await playWelcome();
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error("[welcome-voice] Welcome audio is unavailable.", requestError);
      }
    }

    void prepareAndPlay();
    return () => {
      window.removeEventListener("pointerdown", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    };
  }, []);

  return null;
}
