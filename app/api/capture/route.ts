import { isAdminAuthorized } from "@/lib/projects";
import { captureAndSave } from "@/app/api/thumbnail/route";

export const runtime = "nodejs";

// POST { url } -> { thumbnailUrl } — captures the front page server-side
// and saves it locally so the image always loads (no hotlink flakiness).
export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: "Session expired — please log in again at /admin/login." }, { status: 401 });
  }
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const pageUrl = (body.url ?? "").trim();
  if (!/^https?:\/\//i.test(pageUrl)) {
    return Response.json({ error: "Provide a valid https:// URL." }, { status: 400 });
  }
  try {
    const thumbnailUrl = await captureAndSave(pageUrl);
    return Response.json({ thumbnailUrl });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Capture failed." }, { status: 502 });
  }
}
