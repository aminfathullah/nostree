export const DEFAULT_DOMAIN = (import.meta.env.VITE_PUBLIC_DOMAIN as string) || "tree.majapah.it";

export function getSiteHost(): string {
  if (typeof window !== "undefined" && window.location?.host) {
    return window.location.host;
  }
  return DEFAULT_DOMAIN;
}

export function getSiteOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return `https://${DEFAULT_DOMAIN}`;
}

export function getProfileUrl(slug: string): string {
  const cleanSlug = slug.replace(/^\/+/, "");
  return `${getSiteOrigin()}/${cleanSlug}`;
}
