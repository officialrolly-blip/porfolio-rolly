import { FREE_MODELS } from "@/app/api/chat/route";
import { isAdminAuthorized } from "@/lib/projects";

export const runtime = "nodejs";

const PREFERRED_ORDER = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "z-ai/glm-5.2:free",
  "qwen/qwen3.8-27b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
];

function modelOrder() {
  const preferred = PREFERRED_ORDER.filter((m) => FREE_MODELS.includes(m));
  const rest = FREE_MODELS.filter((m) => !preferred.includes(m));
  return [...preferred, ...rest];
}

async function callOpenRouter(prompt: string, system: string) {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "";
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to .env.local (or Vercel env vars) and restart the dev server."
    );
  }
  const attempts: string[] = [];
  let lastError = "unknown error";
  for (const model of modelOrder()) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Rolly Paredes Portfolio Admin",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // A 401 "User not found" on the FIRST model means the API key itself
        // is invalid/revoked — no point trying the other 25 models.
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            "Your OpenRouter API key was rejected (invalid, revoked, or no credits). " +
            "Get a fresh free key at https://openrouter.ai/keys, put it in .env.local as OPENROUTER_API_KEY, and restart the dev server. " +
            `OpenRouter said: ${text.slice(0, 160)}`
          );
        }
        lastError = `model ${model} -> HTTP ${res.status} ${text.slice(0, 160)}`;
        attempts.push(lastError);
        continue;
      }
      const data = await res.json().catch(() => null);
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) {
        lastError = `model ${model} -> empty reply`;
        attempts.push(lastError);
        continue;
      }
      return { text, model };
    } catch (e) {
      lastError = e instanceof Error ? `${model} -> ${e.message}` : "network error";
      attempts.push(lastError);
    }
  }
  console.error("[generate-description] all models failed:\n" + attempts.join("\n"));
  throw new Error(`AI is unavailable right now. ${lastError}`);
}

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return Response.json(
      { error: "Session expired — please log in again at /admin/login." },
      { status: 401 }
    );
  }
  let body: { title?: string; category?: string; tags?: string[]; url?: string; techStack?: string[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { title = "", category = "social", tags = [], url = "", techStack = [] } = body;
  if (!title.trim()) {
    return Response.json({ error: "Add a title first." }, { status: 400 });
  }
  const system =
    "You are a portfolio copywriter for Rolly Paredes (Social Media Manager, Graphic Artist, Full-Stack Developer). " +
    "Write concise, confident, results-oriented project descriptions. " +
    "Return ONLY the description text, 1-2 sentences, max 40 words, no quotes, no hashtags, no preamble.";
  const prompt =
    category === "dev"
      ? `Write a portfolio description for a full-stack project named "${title}". Tech stack: ${techStack.join(", ") || "modern web stack"}. ${url ? `Live URL: ${url}.` : ""} Focus on what was built and the outcome.`
      : `Write a portfolio description for a ${category === "social" ? "social media" : "graphic design"} project named "${title}". Focus areas/tags: ${tags.join(", ") || "creative work"}. Focus on results and creative problem-solving.`;
  try {
    const { text, model } = await callOpenRouter(prompt, system);
    return Response.json({ description: text, model });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "AI generation failed." }, { status: 502 });
  }
}
