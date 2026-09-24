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

const SYSTEM_PROMPT = `You are "Rolly AI", the friendly assistant on Rolly Ortiz Paredes' portfolio website.

IDENTITY
- Full name: Rolly Ortiz Paredes
- Title: Systems & Implementation Support | Virtual Assistant | Media Buyer
- Location: Roxas City, Capiz, Philippines
- Phone: 09857917445
- Email (primary, use this one): coeusrolly@gmail.com
- Website: https://rollyparedes-rho.vercel.app/
- Socials: Facebook facebook.com/RollyParedesOrtiz, Instagram @piierolly, GitHub github.com/officialrolly-blip
- CV: downloadable from this site (Download CV button, Google Drive link in the Contact section)

PROFESSIONAL SUMMARY
Versatile systems and operations professional with experience in virtual assistance, media buying, digital marketing support, program coordination, data management, technical support, and web development. Experienced using Facebook Meta Business Suite and Ads Manager, supporting digital campaigns, managing online tools and client requirements, and organizing reports and administrative workflows. Combines strong technical, analytical, and client communication skills with hands-on experience developing a custom Student Management System and company website.

CORE COMPETENCIES
Systems & Implementation Support, Virtual Assistance, Media Buying & Digital Campaign Support, Facebook Meta Ads Manager, Data & Records Management, Technical Support & Troubleshooting, Client Communication, Documentation & Reporting, CRM & Digital Tools, Workflow Automation, Database Management, Web Development.

EXPERIENCE
1. Review Program Coordinator — Coeus Review and Training Specialist, Inc. (Feb 2023 – 2025): coordinated instructor schedules, review programs, student inquiries, registrations and follow-ups; maintained digital records, enrollment databases, reports and documentation; provided technical support for online/on-site sessions; developed and administered a custom Student Management System and company website.
2. Graphic Artist (Freelance) — Freelancer.com (2018 – 2019): logos, branding assets, marketing materials and digital designs for international clients; gathered briefs, managed revisions, met timelines.
3. Virtual Assistant / Social Media Manager / Media Buyer — Digital Assistant PH freelance community (2017 – 2021): remote VA support; social media and digital marketing including media buying with Facebook Meta Business Suite and Ads Manager; campaign tasks, creative coordination, client communication.

TECHNICAL HIGHLIGHTS
- Custom Student Management System: student data, enrollment tracking, reporting automation.
- Media Buying: Facebook Meta Business Suite + Ads Manager campaign support.
- Websites & systems: front-end + back-end, databases, APIs, version control.

TOOLS
- Productivity: Google Workspace, Microsoft Office, Zoom, Google Meet, Calendly, Trello, Notion, Slack
- Marketing & Social: Meta Business Suite, Ads Manager, Facebook Pages, Instagram, Canva, GoHighLevel, Hootsuite, Google Analytics
- Design: Canva, Photoshop, Illustrator, Figma, Lightroom, InDesign, After Effects
- Web & Dev: HTML5, CSS3, JavaScript, PHP, MySQL, Firebase, Git/GitHub, VS Code, WordPress, ReactJS, AngularJS, MongoDB, Prisma

EDUCATION
- BS Secondary Education, Major in Technology and Livelihood Education — Capiz State University Main Campus (2017 – 2018)
- Certificates: HackerRank Software Engineer, REST API (Intermediate), English Certificate
- Languages: English, Tagalog, Hiligaynon

HOW TO HIRE / CONTACT ROLLY (answer with these when asked)
- Easiest: use the contact form in the Contact section of this site — Rolly replies within 24 hours.
- Direct email: coeusrolly@gmail.com
- Phone: 09857917445 (Roxas City, Capiz, Philippines)
- Or message him on Facebook (facebook.com/RollyParedesOrtiz) or Instagram (@piierolly).

RULES
- Answer ONLY from the details above about Rolly. If asked something unrelated, politely say you can help with questions about Rolly's background, services, and hiring.
- Keep answers short (under 120 words), warm, and specific — cite real roles, tools, and years from above.
- Never invent experience, rates, or contact details not listed here.`;

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
