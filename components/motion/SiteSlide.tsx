"use client";

import { useSwapReveal } from "@/hooks/useSwapReveal";
import SlideNavButton from "@/components/motion/SlideNavButton";

type SiteSlideProps = {
  children: React.ReactNode;
  nextTarget?: string;
  topTarget?: string;
  className?: string;
  delay?: number;
  reveal?: boolean;
};

export default function SiteSlide({
  children,
  nextTarget,
  topTarget,
  className = "",
  delay = 0,
  reveal = false,
}: SiteSlideProps) {
  const ref = useSwapReveal<HTMLDivElement>({
    threshold: 0.12,
    rootMargin: "0px 0px -10% 0px",
  });

  const hasNav = Boolean(nextTarget || topTarget);

  return (
    <div
      ref={reveal ? ref : undefined}
      className={`site-slide relative ${reveal ? "scroll-swap-down" : ""} ${hasNav ? "site-slide--nav" : ""} ${className}`}
      style={
        reveal ? ({ "--swap-delay": `${delay}ms` } as React.CSSProperties) : undefined
      }
    >
      {children}
      {hasNav ? (
        <div className="site-slide-nav-anchor pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center md:bottom-8">
          {nextTarget ? (
            <SlideNavButton direction="down" target={nextTarget} />
          ) : topTarget ? (
            <SlideNavButton direction="up" target={topTarget} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}