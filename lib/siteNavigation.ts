export type SiteDestination =
  | { type: "home" }
  | { type: "prodotti"; categorySlug?: string | null }
  | { type: "categorie"; categorySlug?: string | null }
  | { type: "assistenza" }
  | { type: "contatti" };

export const SITE_NAVIGATE_EVENT = "site:navigate";
export const SITE_FILTER_CATEGORY_EVENT = "site:filter-category";

export function requestSiteNavigation(destination: SiteDestination) {
  if (typeof document === "undefined") return;
  document.dispatchEvent(
    new CustomEvent<SiteDestination>(SITE_NAVIGATE_EVENT, {
      detail: destination,
    }),
  );
}

export function requestCategoryFilter(categorySlug: string | null) {
  if (typeof document === "undefined") return;
  document.dispatchEvent(
    new CustomEvent<{ categorySlug: string | null }>(SITE_FILTER_CATEGORY_EVENT, {
      detail: { categorySlug },
    }),
  );
}

export function depthForDestination(
  destination: SiteDestination["type"],
): 0 | 1 | 2 | 3 {
  if (destination === "home") return 0;
  if (destination === "prodotti" || destination === "categorie") return 1;
  if (destination === "assistenza") return 2;
  return 3;
}