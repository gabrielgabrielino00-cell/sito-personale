"use client";

import { scrollWithSwap } from "@/lib/motion/viewTransition";
import { hrefToDestination, isSiteHash } from "@/lib/navigation";
import { requestCategoryFilter, requestSiteNavigation } from "@/lib/siteNavigation";

type SwapLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  categorySlug?: string | null;
};

export default function SwapLink({
  href = "#",
  onClick,
  children,
  categorySlug,
  ...props
}: SwapLinkProps) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !href.startsWith("#")) {
          return;
        }

        if (isSiteHash(href)) {
          event.preventDefault();
          const destination = hrefToDestination(href, categorySlug);
          if (!destination) return;

          if (
            destination.type === "prodotti" ||
            destination.type === "categorie"
          ) {
            requestCategoryFilter(destination.categorySlug ?? null);
          }

          requestSiteNavigation(destination);
          return;
        }

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        scrollWithSwap(target);
      }}
    >
      {children}
    </a>
  );
}