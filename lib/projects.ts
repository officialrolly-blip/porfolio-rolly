import fs from "node:fs/promises";
import path from "node:path";

export type ProjectCategory = "social" | "design" | "dev";

export type ProjectItem = {
  id: string;
  category: ProjectCategory;
  title: string;
  description: string;
  tags: string[];
  metric: string;
  imageUrl: string | null;
  // full-stack only
  url?: string | null;
  techStack?: string[];
  thumbnailUrl?: string | null;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "projects.json");

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "seed-social-1",
    category: "social",
    title: "30-Day Awareness Campaign",
    description: "Calendar with reels, carousels, stories that boosted reach.",
    tags: ["Calendar", "Reels", "Analytics"],
    metric: "+120% reach",
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-social-2",
    category: "social",
    title: "Engagement Playbook",
    description: "Comment strategy, DM funnels, weekly lives that built loyalty.",
    tags: ["Community", "UGC", "Lives"],
    metric: "3x comments",
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-social-3",
    category: "social",
    title: "Product Launch Series",
    description: "Teaser-to-launch posts with countdowns and shoutouts.",
    tags: ["Launch", "Promo", "Collabs"],
    metric: "+45% clicks",
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-design-1",
    category: "design",
    title: "Brand Identity Kit",
    description: "Logo lockups, palette, typography, and usage guide.",
    tags: ["Logo", "Palette", "Guide"],
    metric: "12 assets",
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-design-2",
    category: "design",
    title: "Social Template Pack",
    description: "Reusable post, story, and carousel templates.",
    tags: ["Posts", "Stories", "Carousels"],
    metric: "30 templates",
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-design-3",
    category: "design",
    title: "Poster Series",
    description: "Bold event and promo posters for print and digital.",
    tags: ["Posters", "Print", "Digital"],
    metric: "8 posters",
    imageUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-dev-1",
    category: "dev",
    title: "Portfolio Website",
    description: "This glass portfolio — Next.js, Tailwind, animated sections.",
    tags: ["Next.js", "Tailwind", "Vercel"],
    metric: "Live",
    imageUrl: null,
    url: "https://rollyparedes-rho.vercel.app/",
    techStack: ["Next.js", "Tailwind", "Vercel"],
    thumbnailUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-dev-2",
    category: "dev",
    title: "Booking Web App",
    description: "Booking flow with auth, dashboard, and admin panel.",
    tags: ["React", "API", "Database"],
    metric: "Full-stack",
    imageUrl: null,
    url: null,
    techStack: ["React", "API", "Database"],
    thumbnailUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-dev-3",
    category: "dev",
    title: "E-Commerce Storefront",
    description: "Catalog, cart, checkout UI, and order tracking.",
    tags: ["Storefront", "Cart", "Checkout"],
    metric: "Mobile-first",
    imageUrl: null,
    url: null,
    techStack: ["Storefront", "Cart", "Checkout"],
    thumbnailUrl: null,
    createdAt: new Date().toISOString(),
  },
];

export async function readProjects(): Promise<ProjectItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ProjectItem[];
    return DEFAULT_PROJECTS;
  } catch {
    await writeProjects(DEFAULT_PROJECTS).catch(() => {});
    return DEFAULT_PROJECTS;
  }
}

export async function writeProjects(items: ProjectItem[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export function isAdminAuthorized(req: Request) {
  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  const got =
    req.headers.get("x-admin-password") ??
    new URL(req.url).searchParams.get("key") ??
    "";
  return got !== "" && got === expected;
}
