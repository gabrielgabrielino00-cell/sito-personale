"use client";

import { useEffect, useState } from "react";
import {
  clamp,
  computeViewportScroll,
  lerp,
} from "@/lib/motion/parallax";

type HeroParallax = {
  scroll: number;
  pointerX: number;
  pointerY: number;
};

export function useHeroParallax(
  sectionRef: React.RefObject<HTMLElement | null>,
) {
  const [state, setState] = useState<HeroParallax>({
    scroll: 0,
    pointerX: 0,
    pointerY: 0,
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let frame = 0;
    const target = { scroll: 0, pointerX: 0, pointerY: 0 };
    const current = { scroll: 0, pointerX: 0, pointerY: 0 };

    const updateTarget = (clientX?: number, clientY?: number) => {
      const rect = el.getBoundingClientRect();
      target.scroll = computeViewportScroll(rect);

      if (clientX !== undefined && clientY !== undefined) {
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        target.pointerX = clamp((x - 0.5) * 2, -1, 1);
        target.pointerY = clamp((y - 0.5) * 2, -1, 1);
      }
    };

    const tick = () => {
      current.scroll = lerp(current.scroll, target.scroll, 0.09);
      current.pointerX = lerp(current.pointerX, target.pointerX, 0.12);
      current.pointerY = lerp(current.pointerY, target.pointerY, 0.12);

      setState({
        scroll: current.scroll,
        pointerX: current.pointerX,
        pointerY: current.pointerY,
      });

      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => updateTarget();
    const onMove = (event: PointerEvent) =>
      updateTarget(event.clientX, event.clientY);
    const onLeave = () => {
      target.pointerX = 0;
      target.pointerY = 0;
    };

    updateTarget();
    frame = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [sectionRef]);

  return state;
}