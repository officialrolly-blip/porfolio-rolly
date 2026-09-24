export const runtime = "nodejs";

// Every free OpenRouter model available right now (":free" suffix = $0).
// The route tries the requested model first, then falls through the rest,
// so the chat keeps working even when one model is busy or down.
export const FREE_MODELS = [
  "z-ai/glm-5.2:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3.8-27b:free",
  "cohere/north-mini-code:free",
  "thinkingmachines/inkling:free",
  "thinkingmachines/inkling-small:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "nvidia/nemotron-3.5-lightning:free",
  "poolside/laguna-s-2.1:free",
  "poolside/laguna-xs-2.1:free",
  "nex-agi/nex-n2.5-pro:free",
  "nex-agi/nex-n2.5-mini:free",
  "liquid/lfm-2.5-2.6b:free",
  "inclusionai/ling-3.0-flash-fin:free",
  "inclusionai/ling-3.0-flash-sante:free",
  "dots-studio/dots-3-note-preview:free",
  "nvidia/nemotron-3.5-content-safety:free",
];

const SYSTEM_PROMPT = `You are "Rolly AI", the friendly assistant on Rolly Paredes' portfolio website.
Rolly is a Social Media Manager, Graphic Artist, and Full-Stack Developer.
Services: content calendars & community growth, branding & social creatives, React/Next.js websites.
Tools: Meta Business Suite, Canva, Photoshop, Illustrator, CapCut, Notion, VS Code, React, Next.js, Tailwind CSS, TypeScript, Git/GitHub, Vercel, Figma, Trello, ChatGPT, Firebase, WordPress.
Contact: iamrollyparedes@gmail.com, rollyparedesva2@gmail.com, or the contact form on this site.
Socials: facebook.com/RollyParedesOrtiz, instagram @piierolly, github.com/officialrolly-blip.
His CV can be downloaded from the site. Keep answers short (under 120 words), warm, and helpful. When someone wants to hire Rolly, point them to the contact form or his emails.`;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "";
  if (!apiKey) {
    return Response.json(
      { error: "Chat is not configured yet — the site owner needs to add an OPENROUTER_API_KEY." },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[]; model?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20);
  if (history.length === 0) {
    return Response.json({ error: "Send at least one message." }, { status: 400 });
  }

  const requested = body.model && body.model !== "auto" ? body.model : null;
  const order = requested
    ? [requested, ...FREE_MODELS.filter((m) => m !== requested)]
    : [...FREE_MODELS];

  const origin = req.headers.get("origin") ?? "";
  let lastError = "unknown error";

  for (const model of order) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin,
          "X-Title": "Rolly Paredes Portfolio",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });
      if (!res.ok) {
        lastError = `model ${model} returned HTTP ${res.status}`;
        continue;
      }
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        lastError = `model ${model} returned an empty reply`;
        continue;
      }
      return Response.json({ reply, model });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "network error";
    }
  }

  return Response.json(
    { error: `All free models are busy right now (${lastError}). Please try again in a moment!` },
    { status: 502 }
  );
}
