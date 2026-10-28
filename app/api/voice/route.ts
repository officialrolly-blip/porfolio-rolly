export const runtime = "nodejs";

import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";

const MAX_TEXT_LENGTH = 5000;
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
    const client = new ElevenLabsClient({ apiKey });
    const stream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_flash_v2_5",
      outputFormat: "mp3_22050_32",
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
      },
    }, { timeoutInSeconds: 20 });

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      const status = error.statusCode ?? 502;
      const message =
        status === 401
          ? "ElevenLabs could not generate speech (HTTP 401). Check the API key, voice access, and remaining plan quota."
          : `ElevenLabs could not generate speech (HTTP ${status}). Check the API key, voice access, and remaining plan quota.`;
      console.error(`[voice] ElevenLabs returned HTTP ${status}.`);
      return Response.json({ error: message }, { status: 502 });
    }
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error(`[voice] ElevenLabs request ${timedOut ? "timed out" : "failed"}.`);
    return Response.json(
      { error: timedOut ? "Voice generation timed out. Please try again." : "Could not reach ElevenLabs. Please try again." },
      { status: timedOut ? 504 : 502 },
    );
  }
}
