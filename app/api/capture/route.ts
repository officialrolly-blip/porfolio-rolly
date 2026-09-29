import { isAdminAuthorized } from "@/lib/projects";
import { captureAndSave, captureBytes } from "@/app/api/thumbnail/route";

export const runtime = "nodejs";

// POST { url, folder? } -> { thumbnailUrl, imageUrl }
// Captures the front page server-side, uploads the bytes straight to
// ImageKit (so the URL is permanent even on Vercel), and falls back to a
// local /uploads file if ImageKit isn't configured.
export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: "Session expired — please log in again at /admin/login." }, { status: 401 });
  }
  let body: { url?: string; folder?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const pageUrl = (body.url ?? "").trim();
  if (!/^https?:\/\//i.test(pageUrl)) {
    return Response.json({ error: "Provide a valid https:// URL." }, { status: 400 });
  }
  const folder = (body.folder ?? "/social-works").trim() || "/social-works";
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

  // No ImageKit keys (local dev without env) — keep the old local behavior.
  if (!privateKey || !publicKey) {
    try {
      const thumbnailUrl = await captureAndSave(pageUrl);
      return Response.json({ thumbnailUrl, imageUrl: thumbnailUrl });
    } catch (e) {
      return Response.json({ error: e instanceof Error ? e.message : "Capture failed." }, { status: 502 });
    }
  }

  try {
    const { buf, contentType } = await captureBytes(pageUrl);
    // ImageKit server-side upload via plain fetch (no new dependency):
    // POST multipart/form-data to https://upload.imagekit.io/api/v1/files/upload
    // with file (base64 or binary), fileName, folder + Basic auth (privateKey:).
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(buf)], { type: contentType }), `capture-${Date.now()}.jpg`);
    form.append("fileName", `capture-${Date.now()}.jpg`);
    form.append("folder", folder.startsWith("/") ? folder : `/${folder}`);
    const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(privateKey + ":").toString("base64") },
      body: form,
    });
    const ikData = await ikRes.json().catch(() => ({}));
    if (!ikRes.ok || !ikData.url) {
      throw new Error(typeof ikData.message === "string" ? ikData.message : `ImageKit upload failed (HTTP ${ikRes.status}).`);
    }
    const thumbnailUrl: string = ikData.url;
    return Response.json({ thumbnailUrl, imageUrl: thumbnailUrl });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Capture failed." }, { status: 502 });
  }
}
