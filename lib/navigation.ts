import type { SiteDestination } from "@/lib/siteNavigation";

const SITE_HASHES = new Set([
  "#",
  "#prodotti",
  "#categorie",
  "#assistenza",
  "#contatti",
]);

export function isSiteHash(href: string): boolean {
  return SITE_HASHES.has(href);
}

export function hrefToDestination(
  href: string,
  categorySlug?: string | null,
): SiteDestination | null {
  switch (href) {
    case "#":
      return { type: "home" };
    case "#prodotti":
      return { type: "prodotti", categorySlug: categorySlug ?? null };
    case "#categorie":
      return { type: "categorie", categorySlug: categorySlug ?? null };
    case "#assistenza":
      return { type: "assistenza" };
    case "#contatti":
      return { type: "contatti" };
    default:
      return null;
  }
}