"use client";

import { useEffect, useRef } from "react";

type SwapRevealOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  boot?: boolean;
  enabled?: boolean;
};

function isInViewport(el: HTMLElement, rootMargin = "0px") {
  const margin = parseInt(rootMargin, 10) || 0;
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight + margin && rect.bottom >= -margin;
}

export function useSwapReveal<T extends HTMLElement = HTMLDivElement>(
  options: SwapRevealOptions = {},
) {
  const ref = useRef<T>(null);
  const {
    threshold = 0.14,
    rootMargin = "0px 0px -8% 0px",
    once = true,
    boot = false,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add("swap-visible");

    if (boot) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(reveal);
      });
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal();
        if (once) observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(el);

    if (isInViewport(el)) {
      reveal();
      if (once) observer.disconnect();
    }

    return () => observer.disconnect();
  }, [boot, enabled, once, rootMargin, threshold]);

  return ref;
}