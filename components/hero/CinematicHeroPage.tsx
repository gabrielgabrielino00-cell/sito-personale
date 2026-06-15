"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import HomePage from "@/components/HomePage";
import CatalogOverlay from "@/components/hero/CatalogOverlay";
import { useCatalogTransition } from "@/hooks/useCatalogTransition";
import {
  useHeroCatalogScrollTrigger,
  depthToViewMode,
  type CatalogDepth,
} from "@/hooks/useHeroCatalogScrollTrigger";
import type { ThreeHeroHandle } from "@/components/three/ThreeHero";
import { preloadCategoryModels } from "@/components/three/preloadModels";

const ThreeHero = dynamic(
  () =>
    import("@/components/three/ThreeHero").then((mod) => {
      if (typeof document !== "undefined") {
        document.dispatchEvent(new Event("loading:hero"));
      }
      return mod;
    }),
  {
    ssr: false,
    loading: () => (
      <section className="flex h-full min-h-[600px] items-center justify-center bg-[#050505]" />
    ),
  },
);

type ScrollIntent =
  | "reveal"
  | "hide"
  | "assistenza"
  | "assistenzaBack"
  | "contatti"
  | "contattiBack"
  | null;

export default function CinematicHeroPage() {
  const heroRef = useRef<ThreeHeroHandle>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const catalogPanelRef = useRef<HTMLDivElement>(null);
  const catalogScrollRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const depthRef = useRef<CatalogDepth>(0);
  const transitionRunningRef = useRef(false);
  const pendingIntentRef = useRef<ScrollIntent>(null);
  const [catalogDepth, setCatalogDepth] = useState<CatalogDepth>(0);
  const [productsRevealed, setProductsRevealed] = useState(false);
  const [catalogContentReady, setCatalogContentReady] = useState(false);
  const catalogMountedRef = useRef(false);
  const {
    runCatalogReveal,
    runCatalogHide,
    runAssistenzaReveal,
    runAssistenzaHide,
    runContattiReveal,
    runContattiHide,
  } = useCatalogTransition();

  const viewMode = depthToViewMode(catalogDepth);
  const inCatalog = catalogDepth > 0;

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let introTimerId: number | undefined;
    let fallbackTimerId: number | undefined;
    let preloadTimerId: number | undefined;

    const mountCatalog = () => {
      if (cancelled || catalogMountedRef.current) return;
      catalogMountedRef.current = true;
      setCatalogContentReady(true);
      preloadTimerId = window.setTimeout(() => preloadCategoryModels(), 4000);
    };

    const scheduleCatalog = () => {
      if (typeof requestIdleCallback !== "undefined") {
        idleId = requestIdleCallback(mountCatalog, { timeout: 2800 });
        return;
      }
      introTimerId = window.setTimeout(mountCatalog, 1400);
    };

    const onLoadingComplete = () => {
      fallbackTimerId = window.setTimeout(mountCatalog, 6500);
    };

    document.addEventListener("heroIntroComplete", scheduleCatalog, {
      once: true,
    });
    document.addEventListener("loadingComplete", onLoadingComplete, {
      once: true,
    });

    return () => {
      cancelled = true;
      document.removeEventListener("heroIntroComplete", scheduleCatalog);
      document.removeEventListener("loadingComplete", onLoadingComplete);
      if (idleId !== undefined) cancelIdleCallback(idleId);
      if (introTimerId !== undefined) window.clearTimeout(introTimerId);
      if (fallbackTimerId !== undefined) window.clearTimeout(fallbackTimerId);
      if (preloadTimerId !== undefined) window.clearTimeout(preloadTimerId);
    };
  }, []);

  const ensureCatalogContent = useCallback(async () => {
    if (catalogContentReady) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      return;
    }
    setCatalogContentReady(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }, [catalogContentReady]);

  const processPending = useCallback(() => {
    const intent = pendingIntentRef.current;
    if (!intent || transitionRunningRef.current) return;

    pendingIntentRef.current = null;

    if (intent === "reveal" && depthRef.current === 0) {
      void runRevealRef.current();
      return;
    }
    if (intent === "assistenza" && depthRef.current === 1) {
      void runAssistenzaRef.current();
      return;
    }
    if (intent === "assistenzaBack" && depthRef.current === 2) {
      void runAssistenzaBackRef.current();
      return;
    }
    if (intent === "contatti" && depthRef.current === 2) {
      void runContattiRef.current();
      return;
    }
    if (intent === "contattiBack" && depthRef.current === 3) {
      void runContattiBackRef.current();
      return;
    }
    if (intent === "hide" && depthRef.current === 1) {
      void runHideRef.current();
    }
  }, []);

  const runRevealRef = useRef<() => Promise<void>>(async () => {});
  const runHideRef = useRef<() => Promise<void>>(async () => {});
  const runAssistenzaRef = useRef<() => Promise<void>>(async () => {});
  const runAssistenzaBackRef = useRef<() => Promise<void>>(async () => {});
  const runContattiRef = useRef<() => Promise<void>>(async () => {});
  const runContattiBackRef = useRef<() => Promise<void>>(async () => {});

  const runReveal = useCallback(async () => {
    if (transitionRunningRef.current || depthRef.current !== 0) return;
    if (!heroRef.current?.introComplete) return;

    transitionRunningRef.current = true;
    preloadCategoryModels();
    await ensureCatalogContent();

    const panel = catalogPanelRef.current;
    if (!panel?.querySelector("#categorie")) {
      transitionRunningRef.current = false;
      return;
    }

    depthRef.current = 1;
    setCatalogDepth(1);
    setProductsRevealed(true);

    try {
      await runCatalogReveal({
        catalogPanelEl: catalogPanelRef.current,
        productsSectionEl: productsRef.current,
        triggerDezoom: () => heroRef.current!.triggerCatalogDezoom(),
      });
      catalogPanelRef.current?.setAttribute("aria-hidden", "false");
    } catch {
      depthRef.current = 0;
      setCatalogDepth(0);
      setProductsRevealed(false);
      pendingIntentRef.current = null;
    } finally {
      transitionRunningRef.current = false;
      processPending();
    }
  }, [ensureCatalogContent, processPending, runCatalogReveal]);

  const runHide = useCallback(async () => {
    if (transitionRunningRef.current || depthRef.current !== 1) return;
    if (!heroRef.current?.introComplete) return;

    transitionRunningRef.current = true;
    depthRef.current = 0;
    setCatalogDepth(0);
    pendingIntentRef.current = null;

    try {
      await runCatalogHide({
        catalogPanelEl: catalogPanelRef.current,
        productsSectionEl: productsRef.current,
        triggerZoomIn: () => heroRef.current!.triggerCatalogZoomIn(),
      });
      setProductsRevealed(false);
      catalogPanelRef.current?.setAttribute("aria-hidden", "true");
    } catch {
      depthRef.current = 1;
      setCatalogDepth(1);
    } finally {
      transitionRunningRef.current = false;
      processPending();
    }
  }, [processPending, runCatalogHide]);

  const runAssistenza = useCallback(async () => {
    if (transitionRunningRef.current || depthRef.current !== 1) return;

    const panel = catalogPanelRef.current;
    if (!panel?.querySelector("#assistenza")) return;

    transitionRunningRef.current = true;
    depthRef.current = 2;
    setCatalogDepth(2);

    try {
      await runAssistenzaReveal({
        catalogPanelEl: panel,
        catalogScrollEl: catalogScrollRef.current,
      });
    } catch {
      depthRef.current = 1;
      setCatalogDepth(1);
      pendingIntentRef.current = null;
    } finally {
      transitionRunningRef.current = false;
      processPending();
    }
  }, [processPending, runAssistenzaReveal]);

  const runAssistenzaBack = useCallback(async () => {
    if (transitionRunningRef.current || depthRef.current !== 2) return;

    transitionRunningRef.current = true;
    depthRef.current = 1;
    setCatalogDepth(1);

    try {
      await runAssistenzaHide({
        catalogPanelEl: catalogPanelRef.current,
        catalogScrollEl: catalogScrollRef.current,
      });
    } catch {
      depthRef.current = 2;
      setCatalogDepth(2);
    } finally {
      transitionRunningRef.current = false;
      processPending();
    }
  }, [processPending, runAssistenzaHide]);

  const runContatti = useCallback(async () => {
    if (transitionRunningRef.current || depthRef.current !== 2) return;

    const panel = catalogPanelRef.current;
    if (!panel?.querySelector("#contatti")) return;

    transitionRunningRef.current = true;
    depthRef.current = 3;
    setCatalogDepth(3);

    try {
      await runContattiReveal({
        catalogPanelEl: panel,
        catalogScrollEl: catalogScrollRef.current,
      });
    } catch {
      depthRef.current = 2;
      setCatalogDepth(2);
      pendingIntentRef.current = null;
    } finally {
      transitionRunningRef.current = false;
      processPending();
    }
  }, [processPending, runContattiReveal]);

  const runContattiBack = useCallback(async () => {
    if (transitionRunningRef.current || depthRef.current !== 3) return;

    transitionRunningRef.current = true;
    depthRef.current = 2;
    setCatalogDepth(2);

    try {
      await runContattiHide({
        catalogPanelEl: catalogPanelRef.current,
        catalogScrollEl: catalogScrollRef.current,
      });
    } catch {
      depthRef.current = 3;
      setCatalogDepth(3);
    } finally {
      transitionRunningRef.current = false;
      processPending();
    }
  }, [processPending, runContattiHide]);

  runRevealRef.current = runReveal;
  runHideRef.current = runHide;
  runAssistenzaRef.current = runAssistenza;
  runAssistenzaBackRef.current = runAssistenzaBack;
  runContattiRef.current = runContatti;
  runContattiBackRef.current = runContattiBack;

  const canReveal = useCallback(
    () =>
      depthRef.current === 0 &&
      !transitionRunningRef.current &&
      Boolean(heroRef.current?.introComplete),
    [],
  );

  useHeroCatalogScrollTrigger({
    viewportRef,
    depthRef,
    transitionRunningRef,
    pendingIntentRef,
    canReveal,
    onReveal: runReveal,
    onHide: runHide,
    onAssistenzaReveal: runAssistenza,
    onAssistenzaHide: runAssistenzaBack,
    onContattiReveal: runContatti,
    onContattiHide: runContattiBack,
  });

  return (
    <>
      <Header />

      <div
        ref={viewportRef}
        className="fixed inset-x-0 top-[var(--header-h)] z-30 h-[calc(100svh-var(--header-h))] min-h-[560px] overflow-hidden bg-[#050505]"
      >
        <ThreeHero
          ref={heroRef}
          fillViewport
          showHeroText={catalogDepth === 0}
        />
        <CatalogOverlay
          panelRef={catalogPanelRef}
          scrollRef={catalogScrollRef}
          viewMode={viewMode}
          contentReady={catalogContentReady}
        />
      </div>

      <div
        className="h-[calc(100svh-var(--header-h))] min-h-[560px] shrink-0"
        aria-hidden
      />

      <div className="relative z-10 bg-black">
        <HomePage
          productsSectionRef={productsRef}
          productsHidden={!productsRevealed}
          productsPinned={inCatalog}
        />
      </div>
    </>
  );
}