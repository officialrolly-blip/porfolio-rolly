import Image from "next/image";
import { FaAmazon } from "react-icons/fa";
import { SiSpotify } from "react-icons/si";
import type { IconType } from "react-icons";

const profiles: {
  platform: string;
  title: string;
  profileType: string;
  description: string;
  href: string;
  accent: string;
  Icon: IconType;
  action: string;
}[] = [
  {
    platform: "Spotify",
    title: "Independent Music Artist",
    profileType: "Spotify Artist Profile",
    description: "Independent artist profile and music portfolio on Spotify.",
    href: "https://open.spotify.com/artist/5eShoHgEfjFIB8rwkKj52r",
    accent: "bg-[#1DB954]",
    Icon: SiSpotify,
    action: "Listen on Spotify",
  },
  {
    platform: "Amazon",
    title: "Author",
    profileType: "Amazon Author Profile",
    description: "Author profile and digital publishing presence on Amazon.",
    href: "https://www.amazon.com/author/rollyparedes",
    accent: "bg-[#232F3E]",
    Icon: FaAmazon,
    action: "View Amazon Author Page",
  },
];

export default function CreativePortfolio() {
  return (
    <section
      id="creative-portfolio"
      className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-8 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-300/20 via-violet-400/20 to-orange-300/20 blur-3xl dark:from-emerald-500/10 dark:via-violet-600/10 dark:to-orange-500/10" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-violet-500 to-orange-400" />
            Creative Portfolio &amp; Digital Projects
          </span>
        </p>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl dark:text-white">
          More of my{" "}
          <span className="bg-gradient-to-r from-emerald-600 via-violet-600 to-orange-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-violet-400 dark:to-orange-300">
            creative work
          </span>
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Explore my music and publishing profiles on Spotify and Amazon.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {profiles.map(({ platform, title, profileType, description, href, accent, Icon, action }) => (
            <a
              key={platform}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 p-6 shadow backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500 sm:p-8 dark:border-white/15 dark:bg-white/[0.06]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-violet-400/15 via-fuchsia-400/10 to-cyan-300/15 blur-3xl transition group-hover:scale-125"
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg ${accent}`}>
                    <Icon aria-hidden size={25} />
                  </span>
                  <span className="rounded-full border border-white/30 bg-white/30 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-white/15 dark:bg-white/10 dark:text-zinc-300">
                    {platform} profile
                  </span>
                </div>

                <div className="mt-7 flex items-center gap-4">
                  <Image
                    src="/rolly-paredes.jpg"
                    alt="Rolly Paredes"
                    width={80}
                    height={80}
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover object-top ring-2 ring-white/70 shadow-md dark:ring-white/20"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                      {profileType}
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                      {title}
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-900 transition group-hover:gap-3 dark:text-white">
                  {action}
                  <span aria-hidden>↗</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
