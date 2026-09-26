import { isAdminAuthorized } from "@/lib/projects";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  // Reuse the same check the other admin APIs use (x-admin-password header or ?key=).
  const asHeader = new Request(req.url, {
    headers: { "x-admin-password": body.password ?? "" },
  });
  if (!isAdminAuthorized(asHeader)) {
    return Response.json({ ok: false, error: "Wrong password. Try again." }, { status: 401 });
  }
  return Response.json({ ok: true });
}
