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

export default function LoadingScreenController() {
  useLayoutEffect(() => {
    const overlay = document.getElementById("ls-overlay");
    if (!overlay) return;

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

      content.style.willChange = "opacity";
      content.style.transition = "opacity 350ms ease-out";
      content.style.opacity = "0";

      await wait(140);
      if (cancelled) return;

      overlay!.style.willChange = "opacity";
      overlay!.style.transition =
        "opacity 420ms cubic-bezier(0.4, 0, 0.2, 1)";
      overlay!.style.opacity = "0";

      await wait(420);
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
        wait(280),
        waitForLoadingMilestone("scene"),
      ]);

      if (cancelled) return;

      await animateLoadingProgressTo(100, 260);
      await wait(100);
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