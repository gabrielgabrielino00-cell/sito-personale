"use client";

import Link from "next/link";
import { useRef } from "react";
import Logo from "@/components/brand/Logo";
import Canvas3D from "@/components/three/Canvas3D";
import StaggerSwap from "@/components/motion/StaggerSwap";
import SwapLink from "@/components/motion/SwapLink";


export default function SplitHero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="hero-centered hero-swap relative min-h-[min(92vh,820px)] overflow-hidden bg-black"
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 46%, rgba(249,115,22,0.2) 0%, transparent 70%)",
        }}
      />
      <span className="hero-parallax-orb hero-parallax-orb--a" aria-hidden />
      <span className="hero-parallax-orb hero-parallax-orb--b" aria-hidden />

      <div className="hero-canvas absolute inset-x-0 bottom-0 z-[2] top-[var(--header-h)]">
        <Canvas3D
          variant="hero"
          pointerRef={sectionRef}
          className="h-full w-full"
        />
      </div>

      <div className="hero-centered-content pointer-events-none relative z-10 flex min-h-[min(92vh,820px)] flex-col items-center justify-center px-4 py-12 text-center">
        <StaggerSwap className="hero-stagger hero-text-stack max-w-2xl">
          <Link
            href="/"
            className="pointer-events-auto mb-2 inline-block text-white transition-opacity hover:opacity-90"
          >
            <Logo size="xl" className="mx-auto" />
          </Link>
          <p className="hero-text-item mb-5 text-[11px] font-medium tracking-[0.2em] text-gray-400 uppercase md:text-xs">
            Elettronica di consumo
          </p>
          <h1 className="hero-text-item mb-3 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
            Tech{" "}
            <span className="bg-gradient-to-r from-brand to-orange-300 bg-clip-text text-transparent">
              Oggi
            </span>
          </h1>
          <p className="hero-text-item mb-8 text-lg font-medium text-gray-300 md:text-xl">
            Qualità, Convenienza, Velocità—Tutto Qui
          </p>
          <SwapLink
            href="#shop"
            className="hero-text-item pointer-events-auto inline-block rounded-full bg-brand px-10 py-3.5 text-sm font-semibold tracking-wide text-white uppercase shadow-lg shadow-brand/40 transition-all hover:scale-105 hover:bg-brand-dark hover:shadow-xl dark:shadow-brand/30"
          >
            Acquista ora
          </SwapLink>
        </StaggerSwap>
      </div>
    </section>
  );
}