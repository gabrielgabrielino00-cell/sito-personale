"use client";

import { useLayoutEffect } from "react";
import {
  animateLoadingProgressTo,
  bindLoadingProgressUI,
  emitLoadingMilestone,
  initLoadingMilestoneBridge,
  teardownLoadingProgress,
  waitForLoadingMilestone,
} from "@/lib/loadingProgress";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function waitForWindowLoad() {
  return new Promise<void>((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

export default function LoadingScreenController() {
  useLayoutEffect(() => {
    const overlay = document.getElementById("ls-overlay");
    if (!overlay) return;

    const mobile = isMobileViewport();

    initLoadingMilestoneBridge();
    bindLoadingProgressUI();
    emitLoadingMilestone("boot");

    const prevBodyPointerEvents = document.body.style.pointerEvents;
    document.body.style.pointerEvents = "none";

    let cancelled = false;

    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => emitLoadingMilestone("fonts"));
    } else {
      emitLoadingMilestone("fonts");
    }

    void waitForWindowLoad().then(() => emitLoadingMilestone("window"));

    async function exitLoadingScreen() {
      const content = overlay!.querySelector<HTMLElement>(".ls-content");
      if (!content || cancelled) return;

      const contentFadeMs = mobile ? 180 : 350;
      const overlayFadeMs = mobile ? 220 : 420;
      const contentWaitMs = mobile ? 60 : 140;
      const overlayWaitMs = mobile ? 180 : 420;

      content.style.willChange = "opacity";
      content.style.transition = `opacity ${contentFadeMs}ms ease-out`;
      content.style.opacity = "0";

      await wait(contentWaitMs);
      if (cancelled) return;

      overlay!.style.willChange = "opacity";
      overlay!.style.transition = `opacity ${overlayFadeMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      overlay!.style.opacity = "0";

      await wait(overlayWaitMs);
      if (cancelled) return;

      overlay!.style.display = "none";
      overlay!.remove();

      const styles = document.getElementById("ls-styles");
      styles?.remove();

      teardownLoadingProgress();
      document.body.classList.remove("ls-loading-active");
      document.body.style.pointerEvents = prevBodyPointerEvents;
      document.dispatchEvent(new Event("loadingComplete"));
    }

    async function run() {
      await Promise.all([
        wait(mobile ? 0 : 280),
        waitForLoadingMilestone(mobile ? "model" : "scene", mobile ? 8000 : 12000),
      ]);

      if (cancelled) return;

      await animateLoadingProgressTo(100, mobile ? 120 : 260);
      await wait(mobile ? 40 : 100);
      await exitLoadingScreen();
    }

    void run();

    return () => {
      cancelled = true;
      teardownLoadingProgress();
      document.body.style.pointerEvents = prevBodyPointerEvents;
    };
  }, []);

  return null;
}