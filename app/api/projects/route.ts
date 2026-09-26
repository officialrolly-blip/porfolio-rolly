import { isAdminAuthorized, readProjects, writeProjects, type ProjectItem } from "@/lib/projects";

export async function GET() {
  const items = await readProjects();
  return Response.json({ projects: items });
}

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: "Unauthorized — wrong admin password." }, { status: 401 });
  }
  let body: Partial<ProjectItem>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.title || !body.category) {
    return Response.json({ error: "Title and category are required." }, { status: 400 });
  }
  const items = await readProjects();
  const now = new Date().toISOString();
  const item: ProjectItem = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    category: body.category as ProjectItem["category"],
    title: String(body.title).slice(0, 120),
    description: String(body.description ?? "").slice(0, 2000),
    tags: Array.isArray(body.tags) ? body.tags.map(String).slice(0, 8) : [],
    metric: String(body.metric ?? "").slice(0, 60),
    imageUrl: body.imageUrl ? String(body.imageUrl) : null,
    url: body.url ? String(body.url) : null,
    techStack: Array.isArray(body.techStack) ? body.techStack.map(String).slice(0, 10) : [],
    thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl) : null,
    createdAt: now,
  };
  items.unshift(item);
  await writeProjects(items);
  return Response.json({ project: item });
}

export async function DELETE(req: Request) {
  if (!isAdminAuthorized(req)) {
    return Response.json({ error: "Unauthorized — wrong admin password." }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  const items = await readProjects();
  const next = items.filter((p) => p.id !== id);
  await writeProjects(next);
  return Response.json({ ok: true });
}
