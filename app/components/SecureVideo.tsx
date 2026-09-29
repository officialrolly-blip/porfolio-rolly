"use client";
import { useCallback, useRef, useState } from "react";

type Props = { src: string; poster?: string; title?: string; className?: string };

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function SecureVideo({ src, poster, title, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);
  const onSeek = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = val;
    setTime(val);
  }, []);
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next && v.volume === 0) {
      v.volume = volume > 0 ? volume : 0.5;
      setVolume(v.volume);
    }
  }, [volume]);
  const onVolume = useCallback((val: number) => {
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.min(1, Math.max(0, val));
    v.volume = clamped;
    v.muted = clamped === 0;
    setVolume(clamped);
    setMuted(v.muted);
  }, []);
  const goFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  }, []);
  return (
    <div ref={wrapRef} onContextMenu={(e) => e.preventDefault()} className={"group relative w-full select-none overflow-hidden bg-black " + className}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} src={src} poster={poster} preload="metadata" playsInline controls={false} controlsList="nodownload" disablePictureInPicture onContextMenu={(e) => e.preventDefault()} onClick={toggle} onDoubleClick={goFullscreen} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onVolumeChange={(e) => { setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume); }} onLoadedMetadata={(e) => { setDur(e.currentTarget.duration || 0); setMuted(e.currentTarget.muted); setVolume(e.currentTarget.volume ?? 1); }} className="aspect-video w-full object-contain" />
      <span className="pointer-events-none absolute top-3 right-3 z-20 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">Streaming only</span>
      {!playing && (
        <button type="button" onClick={(e) => { e.stopPropagation(); toggle(); }} aria-label={title ? `Play: ${title}` : "Play video"} className="pointer-events-auto absolute inset-x-0 top-0 bottom-16 z-10 grid cursor-pointer place-items-center bg-black/40 transition hover:bg-black/30">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 shadow-2xl transition group-hover:scale-105">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>
          </span>
        </button>
      )}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pt-8 pb-3 text-white">
        <button type="button" onClick={(e) => { e.stopPropagation(); toggle(); }} aria-label={playing ? "Pause" : "Play"} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30">
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>
          )}
        </button>
        <span className="shrink-0 font-mono text-[11px] text-white/90 tabular-nums">{fmt(time)} / {fmt(dur)}</span>
        <input type="range" min={0} max={dur || 0} step={0.1} value={Math.min(time, dur || 0)} onChange={(e) => onSeek(Number(e.target.value))} onClick={(e) => e.stopPropagation()} aria-label="Seek" className="h-1 min-w-0 flex-1 cursor-pointer accent-fuchsia-500" />
        <div className="group/vol flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={(e) => { e.stopPropagation(); toggleMute(); }} aria-label={muted || volume === 0 ? "Unmute" : "Mute"} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30">
            {muted || volume === 0 ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M11 5 6 9H3v6h3l5 4z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
            )}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={(e) => onVolume(Number(e.target.value))} onClick={(e) => e.stopPropagation()} aria-label="Volume" className="hidden h-1 w-16 cursor-pointer accent-fuchsia-500 sm:block" />
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); goFullscreen(); }} aria-label="Fullscreen" className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
        </button>
      </div>
    </div>
  );
}
