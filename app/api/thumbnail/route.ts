export const runtime = "nodejs";
// Allow the capture retries + ImageKit upload to run past the default
// 10s Hobby limit (Pro/paid can go to 60s; Hobby caps at 10s — Vercel
// clamps silently, so the client treats timeouts as "still generating").
export const maxDuration = 60;

function isHttpUrl(u: string) {
  return /^https?:\/\//i.test(u.trim());
}

// Primary: WordPress.com mShots (free, no key, very reliable).
export function wpMshotsUrl(pageUrl: string, width = 1200) {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(pageUrl.trim())}?w=${width}`;
}

// Fallback: thum.io (free, no key) — wants the RAW url, not encoded
// (encoding it returns HTTP 400 — that was the old bug).
export function thumUrl(pageUrl: string) {
  return `https://image.thum.io/get/width/1200/crop/800/noanimate/${pageUrl.trim()}`;
}

// Repair old broken thumbnails saved with an encoded thum.io URL.
export function repairThumbnailUrl(stored: string | null | undefined): string | null {
  if (!stored) return null;
  try {
    const marker = "/noanimate/";
    if (stored.includes("image.thum.io") && stored.includes(marker)) {
      const parts = stored.split(marker);
      const tail = parts[1] ?? "";
      if (tail.includes("%")) {
        const decoded = decodeURIComponent(tail);
        if (isHttpUrl(decoded)) return `${parts[0]}${marker}${decoded}`;
      }
    }
    return stored;
  } catch {
    return stored;
  }
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const url = (q.get("url") ?? "").trim();
  const provider = (q.get("provider") ?? "wp").toLowerCase();
  if (!isHttpUrl(url)) {
    return Response.json({ error: "Provide a valid ?url=https://..." }, { status: 400 });
  }
  const target = provider === "thum" ? thumUrl(url) : wpMshotsUrl(url);
  return Response.redirect(target, 302);
}

// Microlink (free, no key): renders the page server-side and returns a real
// screenshot URL in one call — no "generating preview" placeholder like mShots.
async function microlinkBytes(pageUrl: string): Promise<{ buf: Buffer; contentType: string }> {
  let lastError = "unknown";
  try {
    const api = `https://api.microlink.io?url=${encodeURIComponent(pageUrl.trim())}&screenshot=true&meta=false`;
    const res = await fetch(api, { redirect: "follow", cache: "no-store" });
    if (!res.ok) throw new Error(`Microlink API HTTP ${res.status}`);
    const data: { data?: { screenshot?: { url?: unknown } } } = await res.json().catch(() => ({}));
    const shotUrl: unknown = data?.data?.screenshot?.url;
    if (typeof shotUrl !== "string" || !/^https?:\/\//i.test(shotUrl)) {
      throw new Error("Microlink did not return a screenshot URL (rate-limited or page blocked).");
    }
    const img = await fetch(shotUrl, { redirect: "follow", cache: "no-store" });
    if (!img.ok) throw new Error(`Screenshot download HTTP ${img.status}`);
    const ct = img.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) throw new Error(`Screenshot download not an image (${ct})`);
    const buf = Buffer.from(await img.arrayBuffer());
    if (buf.length < 3000) throw new Error(`Screenshot too small (${buf.length}b)`);
    return { buf, contentType: ct.split(";")[0].trim() || "image/png" };
  } catch (e) {
    lastError = e instanceof Error ? e.message : "microlink failed";
    throw new Error(lastError);
  }
}

async function singleFetchBytes(src: string): Promise<{ buf: Buffer; contentType: string }> {
  const res = await fetch(src, { redirect: "follow", cache: "no-store" });
  if (!res.ok) throw new Error(`${src} -> HTTP ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.startsWith("image/")) throw new Error(`${src} -> not an image (${ct})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 3000) throw new Error(`${src} -> image too small (${buf.length}b)`);
  return { buf, contentType: ct.split(";")[0].trim() || "image/jpeg" };
}

// Rough size of the mShots "generating" placeholder — anything at or below
// this is almost certainly not the real page yet.
const PLACEHOLDER_MAX = 15000;

// Capture the front page server-side and return raw bytes (no disk write,
// so it works on serverless hosts like Vercel where the filesystem is ephemeral).
// Returns the image buffer + content type, or throws.
// Capture order: Microlink first (real screenshot, no placeholder), then
// mShots / thum.io as single-shot fallbacks. No in-function sleeping —
// Vercel Hobby kills functions at 10s, so retrying with 7s sleeps just
// guarantees a timeout. If a provider is still rendering, return
// stillGenerating=true and the client asks the user to hit Capture again.
export async function captureBytes(pageUrl: string): Promise<{ buf: Buffer; contentType: string; stillGenerating: boolean }> {
  const errors: string[] = [];
  try {
    const shot = await microlinkBytes(pageUrl);
    if (shot) return { ...shot, stillGenerating: false };
  } catch (e) {
    errors.push(`microlink: ${e instanceof Error ? e.message : "failed"}`);
  }
  const sources = [wpMshotsUrl(pageUrl), thumUrl(pageUrl)];
  let best: { buf: Buffer; contentType: string } | null = null;
  for (const src of sources) {
    try {
      const got = await singleFetchBytes(src);
      if (!best || got.buf.length > best.buf.length) best = got;
      // Big enough to be the real render — stop here.
      if (got.buf.length > PLACEHOLDER_MAX) {
        return { ...best, stillGenerating: false };
      }
      errors.push(`${src} -> placeholder-size (${got.buf.length}b, still rendering)`);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : `${src} -> failed`);
    }
  }
  if (!best) throw new Error(`Could not capture a screenshot. ${errors.join(" | ")}`);
  return { ...best, stillGenerating: best.buf.length <= PLACEHOLDER_MAX };
}

// Capture the front page server-side and save it to /public/uploads.
// Returns the local /uploads/xxx.jpg URL, or throws.
// (Kept as a fallback for environments without ImageKit configured.)
export async function captureAndSave(pageUrl: string): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const { buf } = await captureBytes(pageUrl);
  const name = `shot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

