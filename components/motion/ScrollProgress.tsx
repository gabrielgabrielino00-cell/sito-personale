"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";

export default function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div className="scroll-swap-track" aria-hidden>
      <div
        className="scroll-swap-bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}