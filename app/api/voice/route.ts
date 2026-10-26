export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 1200;
const DEFAULT_FREE_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ElevenLabs is not configured. Add ELEVENLABS_API_KEY to the server environment." },
      { status: 503 },
    );
  }

  let body: { text?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "Text is required." }, { status: 400 });
  }
  const text = body.text.trim();
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer.` }, { status: 400 });
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_FREE_VOICE_ID;
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_22050_32`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_flash_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!response.ok) {
      console.error(`[voice] ElevenLabs returned HTTP ${response.status}.`);
      return Response.json(
        { error: `ElevenLabs could not generate speech (HTTP ${response.status}). Check the API key, voice access, and remaining plan quota.` },
        { status: 502 },
      );
    }

    return new Response(await response.arrayBuffer(), {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error(`[voice] ElevenLabs request ${timedOut ? "timed out" : "failed"}.`);
    return Response.json(
      { error: timedOut ? "Voice generation timed out. Please try again." : "Could not reach ElevenLabs. Please try again." },
      { status: timedOut ? 504 : 502 },
    );
  }
}
