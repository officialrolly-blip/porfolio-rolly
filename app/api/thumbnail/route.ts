export const runtime = "nodejs";

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

// Capture the front page server-side and save it to /public/uploads.
// Returns the local /uploads/xxx.jpg URL, or throws.
export async function captureAndSave(pageUrl: string): Promise<string> {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const sources = [wpMshotsUrl(pageUrl), thumUrl(pageUrl)];
  let lastError = "unknown";
  for (const src of sources) {
    try {
      const res = await fetch(src, { redirect: "follow" });
      if (!res.ok) {
        lastError = `${src} -> HTTP ${res.status}`;
        continue;
      }
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.startsWith("image/")) {
        lastError = `${src} -> not an image (${ct})`;
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) {
        lastError = `${src} -> image too small (${buf.length}b, probably a placeholder)`;
        continue;
      }
      const name = `shot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
      const dir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, name), buf);
      return `/uploads/${name}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "fetch failed";
    }
  }
  throw new Error(`Could not capture a screenshot. ${lastError}`);
}

