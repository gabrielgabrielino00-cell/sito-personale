"use client";

import { useEffect, useRef } from "react";

/** 0 = hero, 1 = categorie, 2 = assistenza, 3 = contatti */
export type CatalogDepth = 0 | 1 | 2 | 3;

export type CatalogViewMode = "hero" | "categories" | "assistenza" | "contatti";

export function depthToViewMode(depth: CatalogDepth): CatalogViewMode {
  if (depth === 0) return "hero";
  if (depth === 1) return "categories";
  if (depth === 2) return "assistenza";
  return "contatti";
}

type ScrollIntent =
  | "reveal"
  | "hide"
  | "assistenza"
  | "assistenzaBack"
  | "contatti"
  | "contattiBack"
  | null;

type UseHeroCatalogScrollTriggerOptions = {
  viewportRef?: React.RefObject<HTMLElement | null>;
  depthRef: React.RefObject<CatalogDepth>;
  transitionRunningRef: React.RefObject<boolean>;
  pendingIntentRef: React.RefObject<ScrollIntent>;
  canReveal: () => boolean;
  onReveal: () => void;
  onHide: () => void;
  onAssistenzaReveal: () => void;
  onAssistenzaHide: () => void;
  onContattiReveal: () => void;
  onContattiHide: () => void;
};

const SCROLL_THRESHOLD = 18;
const SWIPE_THRESHOLD = 36;

export function useHeroCatalogScrollTrigger({
  viewportRef,
  depthRef,
  transitionRunningRef,
  pendingIntentRef,
  canReveal,
  onReveal,
  onHide,
  onAssistenzaReveal,
  onAssistenzaHide,
  onContattiReveal,
  onContattiHide,
}: UseHeroCatalogScrollTriggerOptions) {
  const touchStartY = useRef(0);
  const wheelAccum = useRef(0);
  const wheelResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canRevealRef = useRef(canReveal);
  const onRevealRef = useRef(onReveal);
  const onHideRef = useRef(onHide);
  const onAssistenzaRevealRef = useRef(onAssistenzaReveal);
  const onAssistenzaHideRef = useRef(onAssistenzaHide);
  const onContattiRevealRef = useRef(onContattiReveal);
  const onContattiHideRef = useRef(onContattiHide);

  canRevealRef.current = canReveal;
  onRevealRef.current = onReveal;
  onHideRef.current = onHide;
  onAssistenzaRevealRef.current = onAssistenzaReveal;
  onAssistenzaHideRef.current = onAssistenzaHide;
  onContattiRevealRef.current = onContattiReveal;
  onContattiHideRef.current = onContattiHide;

  useEffect(() => {
    const queueOrRun = (intent: ScrollIntent) => {
      if (!intent) return false;

      if (transitionRunningRef.current) {
        pendingIntentRef.current = intent;
        return true;
      }

      switch (intent) {
        case "reveal":
          if (depthRef.current === 0 && canRevealRef.current()) {
            onRevealRef.current();
            return true;
          }
          break;
        case "assistenza":
          if (depthRef.current === 1) {
            onAssistenzaRevealRef.current();
            return true;
          }
          break;
        case "contatti":
          if (depthRef.current === 2) {
            onContattiRevealRef.current();
            return true;
          }
          break;
        case "contattiBack":
          if (depthRef.current === 3) {
            onContattiHideRef.current();
            return true;
          }
          break;
        case "assistenzaBack":
          if (depthRef.current === 2) {
            onAssistenzaHideRef.current();
            return true;
          }
          break;
        case "hide":
          if (depthRef.current === 1) {
            onHideRef.current();
            return true;
          }
          break;
        default:
          break;
      }

      return false;
    };

    const handleScrollDown = () => {
      const depth = depthRef.current;

      if (depth === 0) return queueOrRun("reveal");
      if (depth === 1) return queueOrRun("assistenza");
      if (depth === 2) return queueOrRun("contatti");
      return false;
    };

    const handleScrollUp = () => {
      const depth = depthRef.current;

      if (depth === 3) return queueOrRun("contattiBack");
      if (depth === 2) return queueOrRun("assistenzaBack");
      if (depth === 1) return queueOrRun("hide");
      return false;
    };

    const shouldBlockPageScroll = () => depthRef.current < 3;

    const resetWheelAccum = () => {
      wheelAccum.current = 0;
      if (wheelResetTimer.current) {
        clearTimeout(wheelResetTimer.current);
        wheelResetTimer.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      const depth = depthRef.current;
      if (depth > 3) return;

      wheelAccum.current += e.deltaY;

      if (wheelResetTimer.current) {
        clearTimeout(wheelResetTimer.current);
      }
      wheelResetTimer.current = setTimeout(() => {
        wheelResetTimer.current = null;
        wheelAccum.current = 0;
      }, 140);

      const accum = wheelAccum.current;

      if (accum >= SCROLL_THRESHOLD && handleScrollDown()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        resetWheelAccum();
        return;
      }

      if (accum <= -SCROLL_THRESHOLD && handleScrollUp()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        resetWheelAccum();
        return;
      }

      if (shouldBlockPageScroll()) {
        e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const depth = depthRef.current;
      if (depth > 3) return;

      const y = e.touches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - y;

      if (delta > SWIPE_THRESHOLD && handleScrollDown()) {
        e.preventDefault();
        return;
      }

      if (delta < -SWIPE_THRESHOLD && handleScrollUp()) {
        e.preventDefault();
        return;
      }

      if (shouldBlockPageScroll()) {
        e.preventDefault();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") &&
        handleScrollDown()
      ) {
        e.preventDefault();
        return;
      }

      if ((e.key === "ArrowUp" || e.key === "PageUp") && handleScrollUp()) {
        e.preventDefault();
      }
    };

    const opts = { passive: false, capture: true } as const;
    const viewportEl = viewportRef?.current;

    window.addEventListener("wheel", onWheel, opts);
    document.addEventListener("wheel", onWheel, opts);
    viewportEl?.addEventListener("wheel", onWheel, opts);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      resetWheelAccum();
      window.removeEventListener("wheel", onWheel, opts);
      document.removeEventListener("wheel", onWheel, opts);
      viewportEl?.removeEventListener("wheel", onWheel, opts);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove, opts);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    viewportRef,
    depthRef,
    transitionRunningRef,
    pendingIntentRef,
  ]);
}