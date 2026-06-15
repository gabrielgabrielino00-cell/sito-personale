"use client";

import { useEffect, useRef } from "react";
import {
  PARALLAX_ZERO,
  type ParallaxState,
  clamp,
  computeVisibility,
  computeViewportScroll,
  lerp,
} from "@/lib/motion/parallax";

type ParallaxMode = "hero" | "category";

type CanvasParallaxOptions = {
  pointerFollow?: boolean;
};

export function useCanvasParallax(
  containerRef: React.RefObject<HTMLElement | null>,
  mode: ParallaxMode = "hero",
  pointerRef?: React.RefObject<HTMLElement | null>,
  options: CanvasParallaxOptions = {},
) {
  const stateRef = useRef<ParallaxState>({ ...PARALLAX_ZERO });
  const targetRef = useRef<ParallaxState>({ ...PARALLAX_ZERO });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pointerEl = pointerRef?.current ?? el;

    let frame = 0;
    const pointerAlpha =
      mode === "hero" ? 0.42 : options.pointerFollow ? 0.46 : 0.14;

    const updateTarget = (clientX?: number, clientY?: number) => {
      const rect = pointerEl.getBoundingClientRect();
      targetRef.current.scroll = computeViewportScroll(el.getBoundingClientRect());
      targetRef.current.active = computeVisibility(el.getBoundingClientRect());

      if (clientX !== undefined && clientY !== undefined) {
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        targetRef.current.pointerX = clamp((x - 0.5) * 2, -1, 1);
        targetRef.current.pointerY = clamp((y - 0.5) * 2, -1, 1);
      }
    };

    const tick = () => {
      const s = stateRef.current;
      const t = targetRef.current;

      s.scroll = lerp(s.scroll, t.scroll, 0.1);
      s.pointerX = lerp(s.pointerX, t.pointerX, pointerAlpha);
      s.pointerY = lerp(s.pointerY, t.pointerY, pointerAlpha);
      s.active = lerp(s.active, t.active, 0.14);

      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => updateTarget();
    const onMove = (event: PointerEvent) =>
      updateTarget(event.clientX, event.clientY);
    const onLeave = () => {
      targetRef.current.pointerX = 0;
      targetRef.current.pointerY = 0;
    };

    updateTarget();
    frame = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    pointerEl.addEventListener("pointermove", onMove, { capture: true });
    pointerEl.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      pointerEl.removeEventListener("pointermove", onMove, { capture: true });
      pointerEl.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, mode, pointerRef, options.pointerFollow]);

  return stateRef;
}