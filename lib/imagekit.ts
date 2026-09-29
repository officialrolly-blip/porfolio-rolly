// Single source of truth for the ImageKit URL endpoint (CDN base URL).
export const IMAGEKIT_URL_ENDPOINT =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/rollyparedes";

// True when an image is hosted on our ImageKit endpoint (those can be served by
// the optimized @imagekit/next <Image> component; local or third-party URLs can't).
export function isImageKitSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  const bare = IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "");
  return src.startsWith(`${bare}/`) || src.startsWith("https://ik.imagekit.io/");
}
