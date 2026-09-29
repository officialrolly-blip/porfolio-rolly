import { getUploadAuthParams } from "@imagekit/next/server";
import { isAdminAuthorized } from "@/lib/projects";

export const runtime = "nodejs";

// Issues short-lived ImageKit upload credentials (token/expire/signature) to the
// admin panel. The private key never leaves the server — the browser only gets a
// signed, expiring token it can use for a single upload session.
export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: "Unauthorized — wrong admin password." }, { status: 401 });
  }
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return Response.json(
      { error: "ImageKit is not configured — set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in .env.local." },
      { status: 500 },
    );
  }
  try {
    const { token, expire, signature } = getUploadAuthParams({ privateKey, publicKey });
    return Response.json({ token, expire, signature, publicKey });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed to generate ImageKit upload credentials." },
      { status: 500 },
    );
  }
}
