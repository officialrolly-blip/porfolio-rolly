"use client";
import { useState } from "react";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";
import { TABS, inputCls } from "./types";
import type { Category, ProjectItem } from "./types";
import SecureVideo from "../components/SecureVideo";

type Props = {
  tab: Category;
  password: string;
  setNotice: (s: string) => void;
  setAiError: (s: string) => void;
  onPublished: (p: ProjectItem) => void;
};

export default function AdminForm(props: Props) {
  const tab = props.tab;
  const password = props.password;
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [metric, setMetric] = useState("");
  const [url, setUrl] = useState("");
  const [tech, setTech] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewLocal, setPreviewLocal] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState("none");
  const [tried, setTried] = useState("");
  const [justPublished, setJustPublished] = useState(false);
  const [thumbUrl, setThumbUrl] = useState("");
  const [thumbBusy, setThumbBusy] = useState(false);
  const [socialUrl, setSocialUrl] = useState("");
  const [socialCaptureBusy, setSocialCaptureBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoBusy, setVideoBusy] = useState(false);
  const headers = { "Content-Type": "application/json", "x-admin-password": password };
  const label = TABS.find((t) => t.id === tab)?.label ?? tab;

  // Fetches signed, expiring upload credentials from our server route.
  // The ImageKit private key stays server-side; the browser only gets a token.
  async function imagekitAuth() {
    const res = await fetch("/api/upload-auth", { headers: { "x-admin-password": password } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "ImageKit upload authentication failed.");
    return {
      token: String(data.token),
      expire: Number(data.expire),
      signature: String(data.signature),
      publicKey: String(data.publicKey),
    };
  }

  // Turns SDK-specific upload errors into friendly admin-panel messages.
  function uploadError(err: unknown): string {
    if (err instanceof ImageKitAbortError) return "Upload was cancelled.";
    if (err instanceof ImageKitInvalidRequestError) return `ImageKit rejected the file: ${err.message}`;
    if (err instanceof ImageKitUploadNetworkError) return "Network error while uploading to ImageKit — try again.";
    if (err instanceof ImageKitServerError) return `ImageKit error: ${err.message}`;
    return err instanceof Error ? err.message : "Upload failed.";
  }

  async function handleFile(f: File | null) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      props.setNotice("Image must be under 5MB.");
      return;
    }
    setPreviewLocal(URL.createObjectURL(f));
    setBusy("upload");
    props.setNotice("Uploading image to ImageKit...");
    try {
      const auth = await imagekitAuth();
      const result = await upload({
        file: f,
        fileName: `work-${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`,
        folder: `/${tab}-works`,
        ...auth,
        onProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          props.setNotice(`Uploading to ImageKit... ${pct}%`);
        },
      });
      if (!result.url) throw new Error("ImageKit did not return a URL for this upload.");
      setImageUrl(result.url);
      props.setNotice("Image uploaded to ImageKit - now click Generate description.");
    } catch (err) {
      props.setNotice(uploadError(err));
    }
    setBusy("none");
  }

  async function generate() {
    if (!title.trim()) {
      props.setNotice("Add a title first, then generate.");
      return;
    }
    setBusy("ai");
    props.setAiError("");
    props.setNotice("AI is writing your description...");
    setTried("");
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          category: tab,
          tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
          url: url.trim(),
          techStack: tech.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || "AI failed.";
        if (res.status === 401) {
          props.setNotice("Session expired - redirecting to login...");
          sessionStorage.removeItem("admin-key");
          window.setTimeout(() => {
            window.location.href = "/admin/login?next=/admin";
          }, 900);
          setBusy("none");
          return;
        }
        props.setAiError(msg);
        setTried(msg);
        props.setNotice("AI failed - see the amber box above.");
        setBusy("none");
        return;
      }
      setDescription(data.description || "");
      setTried("Model used: " + (data.model || "unknown"));
      props.setNotice("Description generated - review, edit, then Publish.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error.";
      props.setAiError(msg);
      props.setNotice("AI failed - see the amber box above.");
    }
    setBusy("none");
  }

  async function captureSocial() {
    const pageUrl = socialUrl.trim();
    if (!/^https?:\/\//i.test(pageUrl)) {
      props.setNotice("Paste a valid https:// link first, then capture.");
      return;
    }
    setSocialCaptureBusy(true);
    setBusy("upload");
    props.setNotice("Capturing link preview... then uploading to ImageKit.");
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers,
        body: JSON.stringify({ url: pageUrl, folder: `/${tab}-works` }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Capture failed.");
      const captured: string = data.imageUrl || data.thumbnailUrl;
      if (!captured) throw new Error("Capture did not return an image.");
      setImageUrl(captured);
      setPreviewLocal("");
      props.setNotice(
        typeof data.warning === "string" && data.warning
          ? data.warning
          : "Link captured + uploaded to ImageKit - preview below. Now click Generate description.",
      );
    } catch (err) {
      props.setNotice(err instanceof Error ? err.message : "Capture failed.");
    }
    setSocialCaptureBusy(false);
    setBusy("none");
  }

  async function captureThumb() {
    const pageUrl = url.trim();
    if (!/^https?:\/\//i.test(pageUrl)) {
      props.setNotice("Enter a valid https:// URL first, then capture.");
      return;
    }
    setThumbBusy(true);
    props.setNotice("Capturing front page... (tries WordPress mShots, then thum.io)");
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers,
        body: JSON.stringify({ url: pageUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Capture failed.");
      setThumbUrl(data.thumbnailUrl);
      props.setNotice("Thumbnail captured - preview below. Publish to make it live.");
    } catch (err) {
      props.setNotice(err instanceof Error ? err.message : "Capture failed.");
    }
    setThumbBusy(false);
  }

  async function handleVideo(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      props.setNotice("That file is not a video — pick an MP4, WebM, or MOV file.");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      props.setNotice("Video must be under 100MB.");
      return;
    }
    setVideoBusy(true);
    setVideoUrl("");
    props.setNotice("Uploading video to ImageKit...");
    try {
      const auth = await imagekitAuth();
      const result = await upload({
        file: f,
        fileName: `intro-${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`,
        folder: "/video-intros",
        ...auth,
        onProgress: (e) => {
          const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          props.setNotice(`Uploading video to ImageKit... ${pct}%`);
        },
      });
      if (!result.url) throw new Error("ImageKit did not return a URL for this video.");
      setVideoUrl(result.url);
      props.setNotice("Video uploaded to ImageKit - now click Generate description.");
    } catch (err) {
      props.setNotice(uploadError(err));
    }
    setVideoBusy(false);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      props.setNotice("Title required.");
      return;
    }
    if (tab !== "dev" && tab !== "video" && !imageUrl) {
      props.setNotice("Upload an image first.");
      return;
    }
    if (tab === "video" && !videoUrl) {
      props.setNotice("Upload your intro video first.");
      return;
    }
    if (tab === "dev" && !url.trim()) {
      props.setNotice("Add the project URL first.");
      return;
    }
    setBusy("save");
    props.setNotice("Publishing...");
    try {
      const techStack = tech.split(",").map((s) => s.trim()).filter(Boolean);
      const pageUrl = url.trim();
      const res = await fetch("/api/projects", {
        method: "POST",
        headers,
        body: JSON.stringify({
          category: tab,
          title: title.trim(),
          description: description.trim(),
          tags: tab === "dev" ? techStack : tags.split(",").map((s) => s.trim()).filter(Boolean),
          metric: metric.trim() || (tab === "dev" ? "Live" : "New"),
          imageUrl: tab === "dev" ? null : imageUrl || null,
          url: tab === "dev" ? pageUrl : null,
          techStack: tab === "dev" ? techStack : [],
          thumbnailUrl: thumbUrl || null,
          videoUrl: videoUrl || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Publish failed.");
      props.onPublished(data.project);
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 6000);
      setTitle("");
      setTags("");
      setMetric("");
      setUrl("");
      setTech("");
      setImageUrl("");
      setPreviewLocal("");
      setDescription("");
      setTried("");
      setThumbUrl("");
      setSocialUrl("");
      setSocialCaptureBusy(false);
      setVideoUrl("");
      setVideoBusy(false);
      props.setNotice("Published - live in Selected work.");
    } catch (err) {
      props.setNotice(err instanceof Error ? err.message : "Publish failed.");
    }
    setBusy("none");
  }

  return (
    <>
      {busy === "save" && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-zinc-950/70 p-4 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 p-8 text-center text-white shadow-2xl">
            <div className="relative mx-auto grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-fuchsia-500" />
              <span className="absolute inset-2 animate-ping rounded-full bg-fuchsia-500/20" />
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 text-lg font-black">
                ✦
              </span>
            </div>
            <p className="mt-5 text-lg font-extrabold tracking-tight">Publishing your work</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-zinc-300">
              Saving to your showcase
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fuchsia-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fuchsia-400" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fuchsia-400" style={{ animationDelay: "300ms" }} />
              </span>
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            </div>
            <div className="mt-5 space-y-2 text-left text-xs font-semibold">
              <p className="flex items-center gap-2 text-emerald-300">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-[11px]">✓</span>
                Details validated
              </p>
              <p className="flex items-center gap-2 text-white">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving {tab === "video" ? "video intro" : label}...
              </p>
              <p className="flex items-center gap-2 text-zinc-400">
                <span className="h-4 w-4 rounded-full border-2 border-white/15" />
                Refreshing public page
              </p>
            </div>
            <p className="mt-5 text-[11px] text-zinc-400">Please keep this tab open — almost there.</p>
          </div>
        </div>
      )}
      <form onSubmit={publish} className={"space-y-5 " + (busy === "save" ? "pointer-events-none select-none opacity-70" : "")} aria-busy={busy === "save"}>
      <p className="text-sm font-bold">New {label} work</p>
      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
          {tab === "dev" ? "Project name" : "Title"}
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className={inputCls} />
      </label>
      {tab === "video" ? (
        <div className="space-y-5">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Intro video (uploads to ImageKit)</span>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-fuchsia-400/40 bg-zinc-50 px-4 py-8 text-center text-sm transition hover:bg-zinc-100 dark:bg-black/20">
              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideo(e.target.files?.[0] ?? null)} />
              <span className="font-bold">{videoBusy ? "Uploading..." : videoUrl ? "Replace video" : "Click to upload video"}</span>
              <span className="text-xs opacity-70">MP4 / WebM / MOV up to 100MB</span>
            </label>
            {videoUrl ? (
              <div onContextMenu={(e) => e.preventDefault()}>
                <SecureVideo src={videoUrl} title={title || "Intro preview"} className="mt-3 overflow-hidden rounded-2xl border border-zinc-200" />
              </div>
            ) : (
              <p className="mt-2 text-[11px] leading-5 text-zinc-500">No video yet — upload one and it auto-saves to ImageKit, then shows in the Video Introduction section.</p>
            )}
          </div>
        </div>
      ) : tab === "dev" ? (
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Project URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-project.vercel.app" inputMode="url" className={inputCls} />
          </label>
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Front-page thumbnail</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={captureThumb}
                disabled={thumbBusy}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-300 px-4 text-xs font-bold transition hover:bg-zinc-100 disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/10"
              >
                {thumbBusy ? "Capturing..." : "Capture front page"}
              </button>
              <label className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full border border-zinc-300 px-4 text-xs font-bold transition hover:bg-zinc-100 dark:border-white/15 dark:hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (!f) return;
                    props.setNotice("Uploading manual thumbnail to ImageKit...");
                    try {
                      const auth = await imagekitAuth();
                      const result = await upload({
                        file: f,
                        fileName: `thumb-${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`,
                        folder: "/dev-thumbnails",
                        ...auth,
                      });
                      if (!result.url) throw new Error("ImageKit did not return a URL for this upload.");
                      setThumbUrl(result.url);
                      props.setNotice("Manual thumbnail uploaded to ImageKit - preview below.");
                    } catch (err) {
                      props.setNotice(uploadError(err));
                    }
                  }}
                />
                Upload instead
              </label>
            </div>
            {thumbUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbUrl} alt="thumbnail preview" className="mt-3 h-44 w-full rounded-2xl border border-zinc-200 object-cover object-top" />
            ) : (
              <p className="mt-2 text-[11px] leading-5 text-zinc-500">No thumbnail yet — Capture auto-screenshots the site, or upload your own.</p>
            )}
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Tech stack</span>
            <input value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Next.js, Tailwind, Vercel" className={inputCls} />
          </label>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Image — upload or paste a link</span>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-fuchsia-400/40 bg-zinc-50 px-4 py-8 text-center text-sm transition hover:bg-zinc-100 dark:bg-black/20">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              <span className="font-bold">Click to upload image</span>
              <span className="text-xs opacity-70">PNG/JPG up to 5MB — or paste a link below</span>
            </label>
            <div className="mt-3 flex gap-2">
              <input
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                placeholder="https://facebook.com/your-post or instagram.com/..."
                inputMode="url"
                className={inputCls + " h-11"}
              />
              <button
                type="button"
                onClick={captureSocial}
                disabled={socialCaptureBusy}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-zinc-900"
              >
                {socialCaptureBusy && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {socialCaptureBusy ? "Capturing..." : "Capture link"}
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-zinc-500">
              No image file? Paste the post/profile URL and hit <span className="font-bold">Capture link</span> — we screenshot it and auto-upload to ImageKit.
            </p>
            {(previewLocal || imageUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewLocal || imageUrl} alt="preview" className="mt-3 h-44 w-full rounded-2xl border border-zinc-200 object-cover" />
            )}
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Tags</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Calendar, Reels, Analytics" className={inputCls} />
          </label>
        </div>
      )}
      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Metric badge</span>
        <input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="e.g. +120% reach" className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={tab === "video" ? "Click Generate for a 1st-person intro script, or write your own..." : "Click Generate or write your own..."} className={inputCls + " min-h-[120px] resize-y py-3 leading-6"} />
      </label>
      {busy === "save" && (
        <p role="status" className="flex items-center gap-3 rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-fuchsia-500 border-t-transparent" />
          Publishing your work... uploading details, one moment.
        </p>
      )}
      {justPublished && busy === "none" && (
        <p className="flex animate-pulse items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <span>✓</span> Published - live in {tab === "video" ? "Video Introduction" : "Selected work"}.
        </p>
      )}
      <div className="grid gap-2">
        <button type="button" onClick={generate} disabled={busy !== "none"} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0">
          {busy === "ai" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {busy === "ai" ? "Writing... please wait" : "Generate description"}
        </button>
        <button type="submit" disabled={busy !== "none"} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-white dark:text-zinc-900">
          {busy === "save" && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          {busy === "save" ? "Publishing..." : justPublished ? "Published ✓" : "Publish work"}
        </button>
      </div>
      {tried && <p className="rounded-xl bg-zinc-100 px-3 py-2 font-mono text-[11px] text-zinc-500">{tried}</p>}
      </form>
    </>
  );
}
