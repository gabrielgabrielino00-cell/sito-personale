"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { scrollSlideNav } from "@/lib/motion/viewTransition";

type SlideNavButtonProps = {
  direction: "down" | "up";
  target: string;
  label?: string;
  className?: string;
};

const defaultLabels = {
  down: "Continua",
  up: "Torna su",
} as const;

export default function SlideNavButton({
  direction,
  target,
  label,
  className = "",
}: SlideNavButtonProps) {
  const text = label ?? defaultLabels[direction];
  const Icon = direction === "down" ? ChevronDown : ChevronUp;

  return (
    <button
      type="button"
      aria-label={text}
      onClick={(event) => scrollSlideNav(target, direction, event.currentTarget)}
      className={`site-slide-nav-btn site-slide-nav-btn--${direction} group pointer-events-auto inline-flex items-center gap-3 ${className}`}
    >
      <span className="text-xs font-medium tracking-wide text-gray-500 transition-colors group-hover:text-brand dark:text-gray-400">
        {text}
      </span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#111]/90 text-gray-200 shadow-sm transition-all group-hover:border-brand/35 group-hover:bg-brand group-hover:text-white">
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
    </button>
  );
}