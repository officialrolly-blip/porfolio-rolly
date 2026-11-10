"use client";

import { useEffect, useState } from "react";
import { Image as IKImage } from "@imagekit/next";
import { isImageKitSrc } from "@/lib/imagekit";

type Certificate = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
};

function getOrganizationHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "") || "Certifying organization";
  } catch {
    return "Certifying organization";
  }
}

function isCertificate(value: unknown): value is Certificate {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return item.category === "certificate" &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.url === "string";
}

function CertificateImage({ src, title }: { src: string; title: string }) {
  if (isImageKitSrc(src)) {
    return (
      <IKImage
        src={src}
        alt={title}
        width={640}
        height={420}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="h-56 w-full bg-zinc-100 object-contain dark:bg-black/20"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={title} loading="lazy" className="h-56 w-full bg-zinc-100 object-contain dark:bg-black/20" />
  );
}

function OrganizationBadge({ credentialUrl }: { credentialUrl: string }) {
  const [logoIndex, setLogoIndex] = useState(0);
  const host = getOrganizationHost(credentialUrl);
  const logoUrls = (() => {
    try {
      const credentialSite = new URL(credentialUrl);
      return [
        `${credentialSite.origin}/favicon.ico`,
        `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(credentialSite.origin)}&sz=64`,
        `https://icons.duckduckgo.com/ip3/${credentialSite.hostname}.ico`,
      ];
    } catch {
      return [];
    }
  })();
  const logoUrl = logoUrls[logoIndex];

  return (
    <span
      title={`Certifying organization: ${host}`}
      className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-white/70 bg-white/95 px-2.5 py-1.5 text-xs font-bold text-zinc-800 shadow-lg backdrop-blur"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          onError={() => setLogoIndex((index) => index + 1)}
          className="h-6 w-6 shrink-0 rounded-full bg-white object-contain"
        />
      ) : (
        <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-100 text-[10px] font-black uppercase text-violet-700">
          {host.slice(0, 1)}
        </span>
      )}
      <span className="truncate">{host}</span>
    </span>
  );
}

export default function TrainingsCertificates() {
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCertificates() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load trainings and certificates.");
        const data: unknown = await response.json();
        if (typeof data !== "object" || data === null || !("projects" in data) || !Array.isArray(data.projects)) {
          throw new Error("The trainings and certificates response was invalid.");
        }
        setCertificates(data.projects.filter(isCertificate));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load trainings and certificates.");
        setCertificates([]);
      }
    }

    void loadCertificates();
  }, []);

  return (
    <section id="trainings-certificates" className="relative flex w-full scroll-mt-24 justify-center overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400/20 via-violet-400/20 to-fuchsia-400/20 blur-3xl dark:from-cyan-600/10 dark:via-violet-600/10 dark:to-fuchsia-600/10" />
      </div>
      <div className="relative w-full max-w-6xl">
        <p>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-600 shadow backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />
            Trainings &amp; Certificates
          </span>
        </p>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl xl:text-5xl dark:text-white">
          Learning, <span className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">verified</span>
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Trainings and credentials that support the skills I bring to every project.
        </p>
        {certificates === null ? (
          <p role="status" className="mt-8 rounded-2xl border border-white/20 bg-white/40 p-5 text-sm text-zinc-500 dark:bg-white/5">
            Loading credentials...
          </p>
        ) : error ? (
          <p role="alert" className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        ) : certificates.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-white/20 bg-white/40 p-5 text-sm text-zinc-500 dark:bg-white/5">
            Trainings and certificates will appear here soon.
          </p>
        ) : (
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <li key={certificate.id} className="flex flex-col overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.06]">
                <div className="relative">
                  <CertificateImage src={certificate.imageUrl} title={certificate.title} />
                  <OrganizationBadge credentialUrl={certificate.url} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{certificate.title}</h3>
                  <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-400">{certificate.description}</p>
                  <a
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-900"
                  >
                    View Credentials
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
