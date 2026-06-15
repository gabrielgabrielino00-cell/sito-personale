"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";
import HomePage from "@/components/HomePage";
import CatalogOverlay from "@/components/hero/CatalogOverlay";
import ThreeHero from "@/components/three/ThreeHero";
import { useCatalogTransition } from "@/hooks/useCatalogTransition";
import {
  useHeroCatalogScrollTrigger,
  depthToViewMode,
  type CatalogDepth,
} from "@/hooks/useHeroCatalogScrollTrigger";
import type { ThreeHeroHandle } from "@/components/three/ThreeHero";
import { useIsMobile } from "@/hooks/useIsMobile";
import CartPanel from "@/components/cart/CartPanel";
import {
  SITE_NAVIGATE_EVENT,
  depthForDestination,
  requestCategoryFilter,
  type SiteDestination,
} from "@/lib/siteNavigation";

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
  const [heroIntroDone, setHeroIntroDone] = useState(false);
  const catalogMountedRef = useRef(false);
  const isMobile = useIsMobile();
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
    const onIntroDone = () => setHeroIntroDone(true);
    document.addEventListener("heroIntroComplete", onIntroDone);
    if (heroRef.current?.introComplete) setHeroIntroDone(true);
    return () => document.removeEventListener("heroIntroComplete", onIntroDone);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let introTimerId: number | undefined;
    let fallbackTimerId: number | undefined;

    const mountCatalog = () => {
      if (cancelled || catalogMountedRef.current) return;
      catalogMountedRef.current = true;
      setCatalogContentReady(true);
    };

    const idleTimeout = isMobile ? 5200 : 2800;
    const fallbackDelay = isMobile ? 9000 : 6500;
    const introDelay = isMobile ? 2800 : 1400;

    const scheduleCatalog = () => {
      if (typeof requestIdleCallback !== "undefined") {
        idleId = requestIdleCallback(mountCatalog, { timeout: idleTimeout });
        return;
      }
      introTimerId = window.setTimeout(mountCatalog, introDelay);
    };

    const onLoadingComplete = () => {
      fallbackTimerId = window.setTimeout(mountCatalog, fallbackDelay);
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
    };
  }, [isMobile]);

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
  }, [ensureCatalogContent, isMobile, processPending, runCatalogReveal]);

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
    catalogPanelRef,
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

  const waitForTransitionIdle = useCallback(async () => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      if (!transitionRunningRef.current) return;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    }
  }, []);

  const waitForIntro = useCallback(async () => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (heroRef.current?.introComplete) return;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 100));
    }
  }, []);

  const scrollCatalogSection = useCallback((selector: string) => {
    const root = catalogScrollRef.current;
    if (!root) return;
    const target = root.querySelector(selector);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const navigateToDestination = useCallback(
    async (destination: SiteDestination) => {
      const targetDepth = depthForDestination(destination.type);

      if (
        destination.type === "prodotti" ||
        destination.type === "categorie"
      ) {
        requestCategoryFilter(destination.categorySlug ?? null);
      }

      await waitForIntro();

      while (depthRef.current > targetDepth) {
        await waitForTransitionIdle();
        if (depthRef.current === 3) await runContattiBack();
        else if (depthRef.current === 2) await runAssistenzaBack();
        else if (depthRef.current === 1) await runHide();
        else break;
        await waitForTransitionIdle();
      }

      while (depthRef.current < targetDepth) {
        await waitForTransitionIdle();
        if (depthRef.current === 0) await runReveal();
        else if (depthRef.current === 1) await runAssistenza();
        else if (depthRef.current === 2) await runContatti();
        else break;
        await waitForTransitionIdle();
      }

      if (destination.type === "categorie") {
        scrollCatalogSection("#categorie");
      } else if (destination.type === "assistenza") {
        scrollCatalogSection("#assistenza");
      } else if (destination.type === "contatti") {
        scrollCatalogSection("#contatti");
      }
    },
    [
      runAssistenza,
      runAssistenzaBack,
      runContatti,
      runContattiBack,
      runHide,
      runReveal,
      scrollCatalogSection,
      waitForIntro,
      waitForTransitionIdle,
    ],
  );

  useEffect(() => {
    const onNavigate = (event: Event) => {
      const detail = (event as CustomEvent<SiteDestination>).detail;
      void navigateToDestination(detail);
    };

    document.addEventListener(SITE_NAVIGATE_EVENT, onNavigate);
    return () => document.removeEventListener(SITE_NAVIGATE_EVENT, onNavigate);
  }, [navigateToDestination]);

  return (
    <>
      <Header />
      <CartPanel />

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

        {catalogDepth === 0 && heroIntroDone ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-50 border-t-2 border-brand/50 bg-black px-5 py-5 shadow-[0_-12px_40px_rgba(0,0,0,0.75)] md:border-t md:border-white/15 md:border-brand/0 md:bg-[#050505]/95 md:px-8 md:py-3 md:shadow-none"
            aria-live="polite"
          >
            <p className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center md:max-w-md md:flex-row md:gap-2.5">
              <ChevronDown
                className="h-7 w-7 shrink-0 animate-bounce text-brand md:h-3.5 md:w-3.5"
                aria-hidden
              />
              <span className="text-base font-semibold leading-snug text-white md:text-xs md:font-medium md:tracking-[0.2em] md:text-gray-400 md:uppercase">
                <span className="text-brand md:text-gray-400">Scorri giù</span> per
                esplorare prodotti e categorie
              </span>
            </p>
          </div>
        ) : null}
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