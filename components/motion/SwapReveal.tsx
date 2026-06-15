"use client";

import { useSwapReveal } from "@/hooks/useSwapReveal";

type SwapRevealProps = {
  children: React.ReactNode;
  className?: string;
  boot?: boolean;
  variant?: "rise" | "clip" | "cloud";
  delay?: number;
};

export default function SwapReveal({
  children,
  className = "",
  boot = false,
  variant = "rise",
  delay = 0,
}: SwapRevealProps) {
  const ref = useSwapReveal<HTMLDivElement>({ boot });

  return (
    <div
      ref={ref}
      className={`swap-reveal swap-reveal--${variant} ${className}`}
      style={{ "--swap-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}