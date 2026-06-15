"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { CategoryIcon } from "@/lib/data";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { categories } from "@/lib/data";
import SwapReveal from "@/components/motion/SwapReveal";
import { useCoverflowCarousel } from "@/hooks/useCoverflowCarousel";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  requestCategoryFilter,
  requestSiteNavigation,
} from "@/lib/siteNavigation";
const Canvas3D = dynamic(() => import("@/components/three/Canvas3D"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-xl bg-gray-100/50 dark:bg-white/5" />
  ),
});

function CategoryCardStage({
  icon,
  isActive,
  isSwapping,
  showCanvas,
}: {
  icon: CategoryIcon;
  isActive: boolean;
  isSwapping: boolean;
  showCanvas: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={stageRef}
      className={`cat-3d-stage relative h-64 overflow-hidden ${
        isActive ? "is-active" : ""
      } ${isSwapping ? "is-swapping" : ""}`}
    >
      <span className="cat-3d-swap-sheen" aria-hidden />
      {showCanvas ? (
        <Canvas3D
          variant="category"
          categoryIcon={icon}
          isActive={isActive}
          pointerRef={stageRef}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1c1c1c] to-[#101010]"
          aria-hidden
        />
      )}
    </div>
  );
}

function cardMotion(distance: number) {
  const abs = Math.min(Math.abs(distance), 1.5);
  return {
    scale: 1 - abs * 0.08,
    opacity: 1 - abs * 0.32,
    lift: abs * 8,
  };
}

export default function CategoryCarousel() {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { centerIndex, offsets, scrollToIndex } = useCoverflowCarousel(
    scrollRef,
    categories.length,
  );
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const prevCenter = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-cat-card="0"]');
    if (!card) return;
    el.scrollLeft =
      card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2;
  }, []);

  useEffect(() => {
    if (centerIndex === prevCenter.current) return;
    setSwappingIndex(centerIndex);
    prevCenter.current = centerIndex;
    const timer = window.setTimeout(() => setSwappingIndex(null), 800);
    return () => window.clearTimeout(timer);
  }, [centerIndex]);

  const scroll = (dir: "left" | "right") => {
    const next = dir === "left" ? centerIndex - 1 : centerIndex + 1;
    scrollToIndex(Math.max(0, Math.min(categories.length - 1, next)));
  };

  return (
    <section
      id="categorie"
      className="bg-black py-10 pb-16 md:py-12 md:pb-20 dark:bg-black"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SwapReveal variant="clip" className="mb-6 text-center">
          <h2
            data-catalog-title
            className="text-2xl font-bold tracking-wide text-white uppercase md:text-3xl"
          >
            Acquista per categoria
          </h2>
        </SwapReveal>

        <SwapReveal variant="cloud" className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat, index) => (
            <button
              key={cat.slug}
              onClick={() => scrollToIndex(index)}
              className={`cat-pill-swap rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-all ${
                centerIndex === index
                  ? "bg-brand text-white shadow-lg shadow-brand/30"
                  : "bg-gray-100 text-gray-500 hover:text-brand dark:bg-white/5 dark:text-gray-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </SwapReveal>

        <SwapReveal variant="rise" className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute top-1/2 -left-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-all hover:bg-brand hover:text-white md:-left-5 dark:bg-[#1a1a1a] dark:text-gray-300 dark:shadow-black/40"
            aria-label="Precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="cat-coverflow-track flex gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((cat, index) => {
              const distance = offsets[index] ?? 0;
              const isActive = Math.abs(distance) < 0.35;
              const showCanvas = isActive && !isMobile;
              const isSwapping = swappingIndex === index;
              const motion = cardMotion(distance);
              return (
                <article
                  key={cat.slug}
                  data-cat-card={index}
                  style={{
                    transform: `scale(${motion.scale}) translateY(${motion.lift}px)`,
                    opacity: motion.opacity,
                  }}
                  className={`cat-coverflow-card w-[260px] shrink-0 ${
                    isActive ? "is-center" : ""
                  }`}
                >
                  <div
                    className={`overflow-hidden rounded-2xl border bg-[#141414] shadow-md transition-all duration-500 dark:bg-[#141414] ${
                      isActive
                        ? "border-brand/35 shadow-xl shadow-brand/15 dark:border-brand/40"
                        : "border-white/10 dark:border-white/10"
                    }`}
                  >
                    <CategoryCardStage
                      icon={cat.icon}
                      isActive={isActive}
                      isSwapping={isSwapping}
                      showCanvas={showCanvas}
                    />
                    <div className="p-5 text-center">
                      <h3
                        className={`mb-3 text-lg font-semibold transition-colors duration-400 ${
                          isActive
                            ? "text-brand dark:text-brand-light"
                            : "text-white"
                        }`}
                      >
                        {cat.name}
                      </h3>
                      <a
                        href="#prodotti"
                        onClick={(event) => {
                          event.preventDefault();
                          requestCategoryFilter(cat.slug);
                          requestSiteNavigation({
                            type: "prodotti",
                            categorySlug: cat.slug,
                          });
                        }}
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand-dark"
                      >
                        Visualizza i prodotti
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute top-1/2 -right-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-all hover:bg-brand hover:text-white md:-right-5 dark:bg-[#1a1a1a] dark:text-gray-300 dark:shadow-black/40"
            aria-label="Successivo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </SwapReveal>
      </div>
    </section>
  );
}