"use client";

import { useSwapReveal } from "@/hooks/useSwapReveal";

type CloudTone = "ink" | "mist" | "ember";

const toneClass: Record<CloudTone, string> = {
  ink: "cloud-swap-bridge--ink",
  mist: "cloud-swap-bridge--mist",
  ember: "cloud-swap-bridge--ember",
};

export default function CloudDivider({ tone = "mist" }: { tone?: CloudTone }) {
  const ref = useSwapReveal({ threshold: 0.01, rootMargin: "0px" });

  return (
    <div
      ref={ref}
      className={`cloud-swap-bridge ${toneClass[tone]}`}
      aria-hidden
    >
      <svg
        className="cloud-swap-wave"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cloudSwapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(249,115,22,0.08)" />
            <stop offset="50%" stopColor="rgba(249,115,22,0.2)" />
            <stop offset="100%" stopColor="rgba(249,115,22,0.06)" />
          </linearGradient>
        </defs>
        <path
          className="cloud-swap-path"
          d="M0,64 C240,120 480,0 720,48 C960,96 1200,24 1440,72 L1440,120 L0,120 Z"
          fill="url(#cloudSwapGrad)"
        />
      </svg>
      <span className="cloud-swap-orb cloud-swap-orb--a" />
      <span className="cloud-swap-orb cloud-swap-orb--b" />
      <span className="cloud-swap-orb cloud-swap-orb--c" />
      <span className="cloud-swap-grain" />
    </div>
  );
}