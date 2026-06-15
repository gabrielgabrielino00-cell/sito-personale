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
  catalogPanelRef?: React.RefObject<HTMLElement | null>;
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

const WHEEL_THRESHOLD_DESKTOP = 22;
const WHEEL_THRESHOLD_MOBILE = 32;
const SWIPE_THRESHOLD_DESKTOP = 72;
const SWIPE_THRESHOLD_MOBILE = 110;
const COOLDOWN_DESKTOP_MS = 650;
const COOLDOWN_MOBILE_MS = 1200;
const VERTICAL_DOMINANCE_RATIO = 1.35;

const INTERACTIVE_SELECTOR =
  "button,a,input,textarea,select,label,[data-product-card],[data-cat-card],[data-contatti-block],.cat-coverflow-track,.overflow-x-auto,form,[role='button']";

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function isInside(el: HTMLElement | null | undefined, target: EventTarget | null) {
  if (!el || !(target instanceof Node)) return false;
  return el.contains(target);
}

export function useHeroCatalogScrollTrigger({
  viewportRef,
  catalogPanelRef,
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
  const touchStartX = useRef(0);
  const touchActive = useRef(false);
  const gestureConsumed = useRef(false);
  const cooldownUntil = useRef(0);
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
    const inCooldown = () => Date.now() < cooldownUntil.current;

    const startCooldown = () => {
      const ms = isMobileViewport() ? COOLDOWN_MOBILE_MS : COOLDOWN_DESKTOP_MS;
      cooldownUntil.current = Date.now() + ms;
    };

    const queueOrRun = (intent: ScrollIntent) => {
      if (!intent || inCooldown()) return false;

      if (transitionRunningRef.current) {
        pendingIntentRef.current = intent;
        return true;
      }

      let triggered = false;

      switch (intent) {
        case "reveal":
          if (depthRef.current === 0 && canRevealRef.current()) {
            onRevealRef.current();
            triggered = true;
          }
          break;
        case "assistenza":
          if (depthRef.current === 1) {
            onAssistenzaRevealRef.current();
            triggered = true;
          }
          break;
        case "contatti":
          if (depthRef.current === 2) {
            onContattiRevealRef.current();
            triggered = true;
          }
          break;
        case "contattiBack":
          if (depthRef.current === 3) {
            onContattiHideRef.current();
            triggered = true;
          }
          break;
        case "assistenzaBack":
          if (depthRef.current === 2) {
            onAssistenzaHideRef.current();
            triggered = true;
          }
          break;
        case "hide":
          if (depthRef.current === 1) {
            onHideRef.current();
            triggered = true;
          }
          break;
        default:
          break;
      }

      if (triggered) {
        startCooldown();
        pendingIntentRef.current = null;
      }

      return triggered;
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

    const gestureZoneForDepth = (depth: CatalogDepth) => {
      if (depth === 0) return viewportRef?.current ?? null;
      return catalogPanelRef?.current ?? viewportRef?.current ?? null;
    };

    const shouldBlockPageScroll = (depth: CatalogDepth) => depth > 0 && depth < 3;

    const resetWheelAccum = () => {
      wheelAccum.current = 0;
      if (wheelResetTimer.current) {
        clearTimeout(wheelResetTimer.current);
        wheelResetTimer.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      const depth = depthRef.current;
      if (depth > 3 || inCooldown()) return;

      const zone = gestureZoneForDepth(depth);
      if (!isInside(zone, e.target)) return;

      wheelAccum.current += e.deltaY;

      if (wheelResetTimer.current) {
        clearTimeout(wheelResetTimer.current);
      }
      wheelResetTimer.current = setTimeout(() => {
        wheelResetTimer.current = null;
        wheelAccum.current = 0;
      }, 180);

      const threshold = isMobileViewport()
        ? WHEEL_THRESHOLD_MOBILE
        : WHEEL_THRESHOLD_DESKTOP;
      const accum = wheelAccum.current;

      if (accum >= threshold && handleScrollDown()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        resetWheelAccum();
        return;
      }

      if (accum <= -threshold && handleScrollUp()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        resetWheelAccum();
        return;
      }

      if (shouldBlockPageScroll(depth)) {
        e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const depth = depthRef.current;
      const zone = gestureZoneForDepth(depth);
      const touch = e.touches[0];
      if (!touch || !zone || !isInside(zone, e.target)) return;
      if (isInteractiveTarget(e.target)) return;

      touchActive.current = true;
      gestureConsumed.current = false;
      touchStartY.current = touch.clientY;
      touchStartX.current = touch.clientX;
      pendingIntentRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive.current || gestureConsumed.current) return;

      const depth = depthRef.current;
      const zone = gestureZoneForDepth(depth);
      const touch = e.touches[0];
      if (!touch || !zone || !isInside(zone, e.target)) return;

      const deltaY = touchStartY.current - touch.clientY;
      const deltaX = touchStartX.current - touch.clientX;

      if (Math.abs(deltaX) > Math.abs(deltaY) * VERTICAL_DOMINANCE_RATIO) {
        return;
      }

      if (shouldBlockPageScroll(depth) && Math.abs(deltaY) > 8) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchActive.current || gestureConsumed.current) {
        touchActive.current = false;
        return;
      }

      const depth = depthRef.current;
      const zone = gestureZoneForDepth(depth);
      const touch = e.changedTouches[0];
      touchActive.current = false;

      if (!touch || !zone) return;
      if (inCooldown() || transitionRunningRef.current) return;

      const deltaY = touchStartY.current - touch.clientY;
      const deltaX = touchStartX.current - touch.clientX;

      if (Math.abs(deltaX) > Math.abs(deltaY) * VERTICAL_DOMINANCE_RATIO) {
        return;
      }

      const threshold = isMobileViewport()
        ? SWIPE_THRESHOLD_MOBILE
        : SWIPE_THRESHOLD_DESKTOP;

      let triggered = false;
      if (deltaY > threshold) {
        triggered = handleScrollDown();
      } else if (deltaY < -threshold) {
        triggered = handleScrollUp();
      }

      if (triggered) {
        gestureConsumed.current = true;
        pendingIntentRef.current = null;
      }
    };

    const onTouchCancel = () => {
      touchActive.current = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (inCooldown()) return;

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

    const wheelOpts = { passive: false, capture: true } as const;
    const touchMoveOpts = { passive: false, capture: true } as const;
    const viewportEl = viewportRef?.current;
    const panelEl = catalogPanelRef?.current;

    window.addEventListener("wheel", onWheel, wheelOpts);
    document.addEventListener("wheel", onWheel, wheelOpts);
    viewportEl?.addEventListener("wheel", onWheel, wheelOpts);
    panelEl?.addEventListener("wheel", onWheel, wheelOpts);

    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, touchMoveOpts);
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true, capture: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      resetWheelAccum();
      window.removeEventListener("wheel", onWheel, wheelOpts);
      document.removeEventListener("wheel", onWheel, wheelOpts);
      viewportEl?.removeEventListener("wheel", onWheel, wheelOpts);
      panelEl?.removeEventListener("wheel", onWheel, wheelOpts);
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, touchMoveOpts);
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("touchcancel", onTouchCancel, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    viewportRef,
    catalogPanelRef,
    depthRef,
    transitionRunningRef,
    pendingIntentRef,
  ]);
}