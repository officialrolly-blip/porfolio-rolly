export type Category = "social" | "design" | "dev";
export type ProjectItem = {
  id: string; category: Category; title: string; description: string;
  tags: string[]; metric: string; imageUrl: string | null;
  url?: string | null; techStack?: string[]; thumbnailUrl?: string | null; createdAt: string;
};
export const TABS = [
  { id: "social" as Category, tag: "SM", label: "Social Media", hint: "Step 1: title + image. Step 2: generate description, review, publish." },
  { id: "design" as Category, tag: "GD", label: "Graphic Design", hint: "Step 1: title + image. Step 2: generate description, review, publish." },
  { id: "dev" as Category, tag: "DEV", label: "Full-Stack", hint: "Step 1: URL + name + stack (thumbnail auto-creates). Step 2: generate description, publish." },
];
export const inputCls = "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-fuchsia-400 focus:bg-white dark:border-white/15 dark:bg-black/40 dark:text-white";
