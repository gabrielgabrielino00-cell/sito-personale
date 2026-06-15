"use client";

import { useSwapReveal } from "@/hooks/useSwapReveal";

type StaggerSwapProps = {
  children: React.ReactNode;
  className?: string;
  boot?: boolean;
  /** Disabilita IntersectionObserver — utile quando GSAP controlla la reveal */
  observe?: boolean;
};

export default function StaggerSwap({
  children,
  className = "",
  boot = false,
  observe = true,
}: StaggerSwapProps) {
  const ref = useSwapReveal({ boot, threshold: 0.08, enabled: observe });

  return (
    <div ref={observe ? ref : undefined} className={`stagger-swap ${className}`}>
      {children}
    </div>
  );
}