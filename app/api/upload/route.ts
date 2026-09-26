import fs from "node:fs/promises";
import path from "node:path";
import { isAdminAuthorized } from "@/lib/projects";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: "Unauthorized — wrong admin password." }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Image must be under 5MB." }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const name = `work-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);
    return Response.json({ url: `/uploads/${name}` });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 500 });
  }
}
