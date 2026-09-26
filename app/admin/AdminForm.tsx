"use client";
import { useState } from "react";
import { TABS, inputCls } from "./types";
import type { Category, ProjectItem } from "./types";

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
  const [thumbUrl, setThumbUrl] = useState("");
  const [thumbBusy, setThumbBusy] = useState(false);
  const headers = { "Content-Type": "application/json", "x-admin-password": password };
  const label = TABS.find((t) => t.id === tab)?.label ?? tab;

  async function handleFile(f: File | null) {
    if (!f) return;
    setPreviewLocal(URL.createObjectURL(f));
    setBusy("upload");
    props.setNotice("Uploading image...");
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setImageUrl(data.url);
      props.setNotice("Image uploaded - now click Generate description.");
    } catch (err) {
      props.setNotice(err instanceof Error ? err.message : "Upload failed.");
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

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      props.setNotice("Title required.");
      return;
    }
    if (tab !== "dev" && !imageUrl) {
      props.setNotice("Upload an image first.");
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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Publish failed.");
      props.onPublished(data.project);
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
      props.setNotice("Published - live in Selected work.");
    } catch (err) {
      props.setNotice(err instanceof Error ? err.message : "Publish failed.");
    }
    setBusy("none");
  }

  return (
    <form onSubmit={publish} className="space-y-5">
      <p className="text-sm font-bold">New {label} work</p>
      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">
          {tab === "dev" ? "Project name" : "Title"}
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className={inputCls} />
      </label>
      {tab === "dev" ? (
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
                    props.setNotice("Uploading manual thumbnail...");
                    try {
                      const form = new FormData();
                      form.append("file", f);
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        headers: { "x-admin-password": password },
                        body: form,
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(data.error || "Upload failed.");
                      setThumbUrl(data.url);
                      props.setNotice("Manual thumbnail uploaded - preview below.");
                    } catch (err) {
                      props.setNotice(err instanceof Error ? err.message : "Upload failed.");
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
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Image</span>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-fuchsia-400/40 bg-zinc-50 px-4 py-8 text-center text-sm transition hover:bg-zinc-100 dark:bg-black/20">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
              <span className="font-bold">Click to upload image</span>
              <span className="text-xs opacity-70">PNG/JPG up to 5MB</span>
            </label>
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
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Click Generate or write your own..." className={inputCls + " min-h-[120px] resize-y py-3 leading-6"} />
      </label>
      <div className="grid gap-2">
        <button type="button" onClick={generate} disabled={busy === "ai"} className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60">
          {busy === "ai" ? "Writing... please wait" : "Generate description"}
        </button>
        <button type="submit" disabled={busy === "save"} className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-white dark:text-zinc-900">
          {busy === "save" ? "Publishing..." : "Publish work"}
        </button>
      </div>
      {tried && <p className="rounded-xl bg-zinc-100 px-3 py-2 font-mono text-[11px] text-zinc-500">{tried}</p>}
    </form>
  );
}
