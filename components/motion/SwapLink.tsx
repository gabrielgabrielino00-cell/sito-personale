"use client";

import { scrollWithSwap } from "@/lib/motion/viewTransition";

type SwapLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function SwapLink({
  href = "#",
  onClick,
  children,
  ...props
}: SwapLinkProps) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !href.startsWith("#") || href === "#") {
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