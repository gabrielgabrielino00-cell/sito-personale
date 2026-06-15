"use client";

import { useSwapReveal } from "@/hooks/useSwapReveal";

type ScrollSwapSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export default function ScrollSwapSection({
  children,
  className = "",
  delay = 0,
}: ScrollSwapSectionProps) {
  const ref = useSwapReveal<HTMLDivElement>({
    threshold: 0.12,
    rootMargin: "0px 0px -10% 0px",
  });

  return (
    <div
      ref={ref}
      className={`scroll-swap-down ${className}`}
      style={{ "--swap-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}