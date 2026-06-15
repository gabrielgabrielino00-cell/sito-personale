"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";
import {
  assistenzaHideTiming,
  assistenzaRevealTiming,
  catalogRevealTiming,
  contattiHideTiming,
  contattiRevealTiming,
} from "@/lib/cinematic/config";

const EASE_EXIT = "power4.in";
const EASE_ENTER = "expo.out";
const EASE_TITLE = "power3.out";
const EASE_CARD = "back.out(1.35)";
const EASE_ICON = "back.out(2.1)";

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function getCatalogSections(catalogPanelEl: HTMLElement | null) {
  return {
    categoriesEl: catalogPanelEl?.querySelector<HTMLElement>("#categorie") ?? null,
    assistenzaEl: catalogPanelEl?.querySelector<HTMLElement>("#assistenza") ?? null,
    contattiEl: catalogPanelEl?.querySelector<HTMLElement>("#contatti") ?? null,
  };
}

function hideStackedSections(
  assistenzaEl: HTMLElement | null,
  contattiEl: HTMLElement | null,
) {
  if (assistenzaEl) {
    gsap.set(assistenzaEl, {
      opacity: 0,
      y: 110,
      scale: 0.93,
      filter: "blur(14px)",
      pointerEvents: "none",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      transformOrigin: "50% 18%",
    });
  }
  if (contattiEl) {
    gsap.set(contattiEl, {
      opacity: 0,
      y: 110,
      scale: 0.93,
      filter: "blur(14px)",
      pointerEvents: "none",
      visibility: "hidden",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 0,
      transformOrigin: "50% 18%",
    });
  }
}

function finalizeAssistenzaActive(assistenzaEl: HTMLElement | null) {
  if (!assistenzaEl) return;

  gsap.set(assistenzaEl, {
    position: "relative",
    visibility: "visible",
    height: "auto",
    overflow: "visible",
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "none",
    pointerEvents: "auto",
    clearProps: "top,left,right,zIndex,transformOrigin,margin,padding",
  });

  const titles = assistenzaEl.querySelectorAll("[data-assistenza-title]");
  const subtitles = assistenzaEl.querySelectorAll("[data-assistenza-subtitle]");
  const cards = assistenzaEl.querySelectorAll(
    "[data-assistenza-card], .feature-swap-card",
  );
  const icons = assistenzaEl.querySelectorAll(".feature-swap-icon");

  if (titles.length) {
    gsap.set(titles, { opacity: 1, y: 0, clipPath: "none" });
  }
  if (subtitles.length) {
    gsap.set(subtitles, { opacity: 1, y: 0, filter: "none" });
  }
  if (cards.length) {
    gsap.set(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "none",
      clearProps: "transform,transformOrigin",
    });
  }
  if (icons.length) {
    gsap.set(icons, { opacity: 1, scale: 1 });
  }
}

function resetContattiHidden(contattiEl: HTMLElement | null) {
  if (!contattiEl) return;

  hideStackedSections(null, contattiEl);

  const animated = contattiEl.querySelectorAll(
    "[data-contatti-title], [data-contatti-subtitle], [data-contatti-block], [data-contatti-footer], [data-contatti-social]",
  );
  if (animated.length) {
    gsap.set(animated, { clearProps: "all" });
  }
}

function releaseInlineMotion(nodes: NodeListOf<Element> | Element[] | undefined) {
  if (!nodes?.length) return;
  nodes.forEach((node) => {
    const el = node as HTMLElement;
    el.style.opacity = "";
    el.style.transform = "";
  });
}

function primeAssistenzaReveal(
  assistenzaEl: HTMLElement | null,
  zIndex = 2,
) {
  if (!assistenzaEl) return;
  gsap.set(assistenzaEl, {
    visibility: "visible",
    height: "auto",
    overflow: "visible",
    clearProps: "margin,padding",
    opacity: 0,
    y: 110,
    scale: 0.93,
    filter: "blur(14px)",
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex,
    transformOrigin: "50% 18%",
  });
  assistenzaEl
    .querySelector(".stagger-swap")
    ?.classList.remove("swap-visible");
}

function getCategoryNavButtons(categoriesEl: HTMLElement | null) {
  return (
    categoriesEl?.querySelectorAll<HTMLElement>(
      'button[aria-label="Precedente"], button[aria-label="Successivo"]',
    ) ?? null
  );
}

function parkCategories(categoriesEl: HTMLElement | null) {
  if (!categoriesEl) return;
  gsap.set(categoriesEl, {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    visibility: "hidden",
    height: 0,
    overflow: "hidden",
    margin: 0,
    padding: 0,
    pointerEvents: "none",
  });
}

function restoreCategories(categoriesEl: HTMLElement | null) {
  if (!categoriesEl) return;
  gsap.set(categoriesEl, {
    position: "relative",
    visibility: "visible",
    height: "auto",
    overflow: "visible",
    clearProps: "margin,padding,top,left,right",
    pointerEvents: "auto",
  });
}

function parkAssistenza(assistenzaEl: HTMLElement | null) {
  if (!assistenzaEl) return;
  gsap.set(assistenzaEl, {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    visibility: "hidden",
    height: 0,
    overflow: "hidden",
    margin: 0,
    padding: 0,
    pointerEvents: "none",
  });
}

function primeContattiReveal(contattiEl: HTMLElement | null) {
  if (!contattiEl) return;
  gsap.set(contattiEl, {
    visibility: "visible",
    opacity: 0,
    y: 110,
    scale: 0.93,
    filter: "blur(14px)",
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    transformOrigin: "50% 18%",
  });
}

type CatalogRevealParams = {
  catalogPanelEl: HTMLElement | null;
  productsSectionEl: HTMLElement | null;
  triggerDezoom: () => Promise<void>;
};

type CatalogHideParams = {
  catalogPanelEl: HTMLElement | null;
  productsSectionEl: HTMLElement | null;
  triggerZoomIn: () => Promise<void>;
};

type AssistenzaTransitionParams = {
  catalogPanelEl: HTMLElement | null;
  catalogScrollEl?: HTMLElement | null;
};

type TimelineSlot = {
  timeline: gsap.core.Timeline | null;
  resolve: (() => void) | null;
};

function settleTimelineSlot(slot: TimelineSlot) {
  slot.timeline?.kill();
  slot.timeline = null;
  if (slot.resolve) {
    const done = slot.resolve;
    slot.resolve = null;
    done();
  }
}

function beginTimeline(slot: TimelineSlot, onComplete: () => void) {
  settleTimelineSlot(slot);
  const tl = gsap.timeline({
    onComplete: () => {
      slot.timeline = null;
      if (slot.resolve) {
        const done = slot.resolve;
        slot.resolve = null;
        done();
      }
    },
  });
  slot.timeline = tl;
  slot.resolve = onComplete;
  return tl;
}

export function useCatalogTransition() {
  const catalogSlot = useRef<TimelineSlot>({ timeline: null, resolve: null });
  const assistenzaSlot = useRef<TimelineSlot>({ timeline: null, resolve: null });
  const contattiSlot = useRef<TimelineSlot>({ timeline: null, resolve: null });

  const runCatalogReveal = useCallback(
    ({
      catalogPanelEl,
      productsSectionEl,
      triggerDezoom,
    }: CatalogRevealParams): Promise<void> =>
      new Promise((resolve) => {
        settleTimelineSlot(assistenzaSlot.current);
        settleTimelineSlot(contattiSlot.current);
        const tl = beginTimeline(catalogSlot.current, resolve);

        const { categoriesEl, assistenzaEl, contattiEl } =
          getCatalogSections(catalogPanelEl);
        hideStackedSections(assistenzaEl, contattiEl);

        if (categoriesEl) {
          restoreCategories(categoriesEl);
          gsap.set(categoriesEl, { opacity: 1, y: 0 });
        }

        const categoryCards =
          catalogPanelEl?.querySelectorAll("[data-cat-card]");
        const productCards =
          productsSectionEl?.querySelectorAll("[data-product-card]");
        const titles = [
          ...(categoriesEl?.querySelectorAll("[data-catalog-title]") ?? []),
          ...(productsSectionEl?.querySelectorAll("[data-catalog-title]") ?? []),
        ];

        const t = catalogRevealTiming(isMobileViewport());

        tl.add(() => triggerDezoom(), 0);

        if (catalogPanelEl) {
          tl.fromTo(
            catalogPanelEl,
            { yPercent: 100, opacity: 0, pointerEvents: "none" },
            {
              yPercent: 0,
              opacity: 1,
              pointerEvents: "auto",
              duration: t.panelDuration,
              ease: "expo.out",
            },
            t.panelAt,
          );
        }

        if (titles.length) {
          tl.fromTo(
            titles,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: t.titlesDuration,
              stagger: 0.1,
              ease: "power3.out",
            },
            t.titlesAt,
          );
        }

        if (categoryCards?.length) {
          tl.fromTo(
            categoryCards,
            { opacity: 0, y: 40, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: t.categoryCardsDuration,
              stagger: t.categoryCardsStagger,
              ease: "power3.out",
            },
            t.categoryCardsAt,
          );
        }

        if (productsSectionEl) {
          tl.fromTo(
            productsSectionEl,
            { opacity: 0, y: 72, pointerEvents: "none" },
            {
              opacity: 1,
              y: 0,
              pointerEvents: "auto",
              duration: t.productsDuration,
              ease: "expo.out",
            },
            t.productsAt,
          );
        }

        if (productCards?.length) {
          tl.fromTo(
            productCards,
            { opacity: 0, y: 56 },
            {
              opacity: 1,
              y: 0,
              duration: t.productCardsDuration,
              stagger: t.productCardsStagger,
              ease: "expo.out",
            },
            t.productCardsAt,
          );
        }
      }),
    [],
  );

  const runCatalogHide = useCallback(
    ({
      catalogPanelEl,
      productsSectionEl,
      triggerZoomIn,
    }: CatalogHideParams): Promise<void> =>
      new Promise((resolve) => {
        settleTimelineSlot(assistenzaSlot.current);
        settleTimelineSlot(contattiSlot.current);
        const { assistenzaEl, contattiEl } = getCatalogSections(catalogPanelEl);
        const categoryCards =
          catalogPanelEl?.querySelectorAll("[data-cat-card]");
        const productCards =
          productsSectionEl?.querySelectorAll("[data-product-card]");

        const tl = beginTimeline(catalogSlot.current, () => {
          if (catalogPanelEl) {
            gsap.set(catalogPanelEl, {
              yPercent: 100,
              opacity: 0,
              pointerEvents: "none",
            });
          }
          if (productsSectionEl) {
            gsap.set(productsSectionEl, {
              opacity: 0,
              y: 72,
              pointerEvents: "none",
            });
          }
          hideStackedSections(assistenzaEl, contattiEl);
          resolve();
        });

        tl.add(() => triggerZoomIn(), 0);

        if (productCards?.length) {
          tl.to(
            productCards,
            {
              opacity: 0,
              y: 40,
              duration: 0.4,
              stagger: 0.03,
              ease: "power2.in",
            },
            0,
          );
        }

        if (productsSectionEl) {
          tl.to(
            productsSectionEl,
            {
              opacity: 0,
              y: 48,
              pointerEvents: "none",
              duration: 0.55,
              ease: "power2.in",
            },
            0.05,
          );
        }

        if (categoryCards?.length) {
          tl.to(
            categoryCards,
            {
              opacity: 0,
              y: 36,
              scale: 0.96,
              duration: 0.45,
              stagger: 0.04,
              ease: "power2.in",
            },
            0.08,
          );
        }

        if (catalogPanelEl) {
          tl.to(
            catalogPanelEl,
            {
              yPercent: 100,
              opacity: 0,
              pointerEvents: "none",
              duration: 0.9,
              ease: "power3.inOut",
            },
            0.12,
          );
        }
      }),
    [],
  );

  const runAssistenzaReveal = useCallback(
    ({ catalogPanelEl, catalogScrollEl }: AssistenzaTransitionParams): Promise<void> =>
      new Promise((resolve) => {
        settleTimelineSlot(contattiSlot.current);
        const { categoriesEl, assistenzaEl, contattiEl } =
          getCatalogSections(catalogPanelEl);
        const categoryPills =
          categoriesEl?.querySelectorAll(".cat-pill-swap");
        const categoryNav = getCategoryNavButtons(categoriesEl);
        const categoryCards =
          categoriesEl?.querySelectorAll("[data-cat-card]");
        const categoryTitles =
          categoriesEl?.querySelectorAll("[data-catalog-title]");
        const assistenzaTitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-title]");
        const assistenzaSubtitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-subtitle]");
        const assistenzaCards =
          assistenzaEl?.querySelectorAll("[data-assistenza-card]").length
            ? assistenzaEl.querySelectorAll("[data-assistenza-card]")
            : assistenzaEl?.querySelectorAll(".feature-swap-card");
        const assistenzaIcons =
          assistenzaEl?.querySelectorAll(".feature-swap-icon");

        if (contattiEl) hideStackedSections(null, contattiEl);
        primeAssistenzaReveal(assistenzaEl);
        if (catalogScrollEl) catalogScrollEl.scrollTop = 0;
        releaseInlineMotion(categoryCards);

        if (assistenzaTitles?.length) {
          gsap.set(assistenzaTitles, {
            opacity: 0,
            y: 44,
            clipPath: "inset(0 0 100% 0)",
          });
        }
        if (assistenzaSubtitles?.length) {
          gsap.set(assistenzaSubtitles, { opacity: 0, y: 22, filter: "blur(6px)" });
        }
        if (assistenzaCards?.length) {
          gsap.set(assistenzaCards, {
            opacity: 0,
            y: 56,
            scale: 0.9,
            filter: "blur(10px)",
            transformOrigin: "50% 80%",
          });
        }
        if (assistenzaIcons?.length) {
          gsap.set(assistenzaIcons, { scale: 0.55, opacity: 0 });
        }

        const tl = beginTimeline(assistenzaSlot.current, () => {
          parkCategories(categoriesEl);
          finalizeAssistenzaActive(assistenzaEl);
          resolve();
        });

        const t = assistenzaRevealTiming(isMobileViewport());

        if (catalogPanelEl) {
          tl.fromTo(
            catalogPanelEl,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.992,
              filter: "brightness(0.94)",
              duration: t.panelBreatheDuration * 0.45,
              ease: "power2.inOut",
              yoyo: true,
              repeat: 1,
            },
            t.panelBreatheAt,
          );
        }

        if (categoryPills?.length) {
          tl.to(
            categoryPills,
            {
              opacity: 0,
              y: -22,
              scale: 0.86,
              filter: "blur(6px)",
              duration: t.pillsOutDuration,
              stagger: { each: 0.03, from: "center" },
              ease: EASE_EXIT,
            },
            t.pillsOutAt,
          );
        }

        if (categoryNav?.length) {
          tl.to(
            categoryNav,
            {
              opacity: 0,
              scale: 0.82,
              duration: t.navOutDuration,
              stagger: 0.04,
              ease: EASE_EXIT,
            },
            t.navOutAt,
          );
        }

        if (categoryCards?.length) {
          tl.to(
            categoryCards,
            {
              opacity: 0,
              y: -52,
              scale: 0.88,
              rotateY: -10,
              filter: "blur(12px)",
              duration: t.cardsOutDuration,
              stagger: { each: t.cardsOutStagger, from: "center" },
              ease: EASE_EXIT,
            },
            t.cardsOutAt,
          );
        }

        if (categoryTitles?.length) {
          tl.to(
            categoryTitles,
            {
              opacity: 0,
              y: -38,
              scale: 0.96,
              filter: "blur(8px)",
              duration: t.catTitleOutDuration,
              ease: EASE_EXIT,
            },
            t.catTitleOutAt,
          );
        }

        if (categoriesEl) {
          tl.to(
            categoriesEl,
            {
              opacity: 0,
              y: -76,
              scale: 0.95,
              filter: "blur(14px)",
              pointerEvents: "none",
              duration: t.sectionOutDuration,
              ease: EASE_EXIT,
            },
            t.sectionOutAt,
          );
          tl.add(() => parkCategories(categoriesEl), t.sectionOutAt + t.sectionOutDuration * 0.72);
        }

        if (assistenzaEl) {
          tl.fromTo(
            assistenzaEl,
            {
              opacity: 0,
              y: 110,
              scale: 0.93,
              filter: "blur(14px)",
              pointerEvents: "none",
              visibility: "visible",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              pointerEvents: "auto",
              visibility: "visible",
              duration: t.sectionInDuration,
              ease: EASE_ENTER,
            },
            t.sectionInAt,
          );
        }

        if (assistenzaTitles?.length) {
          tl.fromTo(
            assistenzaTitles,
            { opacity: 0, y: 44, clipPath: "inset(0 0 100% 0)" },
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: t.titleInDuration,
              ease: EASE_TITLE,
            },
            t.titleInAt,
          );
        }

        if (assistenzaSubtitles?.length) {
          tl.fromTo(
            assistenzaSubtitles,
            { opacity: 0, y: 22, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: t.subtitleInDuration,
              ease: EASE_TITLE,
            },
            t.subtitleInAt,
          );
        }

        if (assistenzaCards?.length) {
          tl.fromTo(
            assistenzaCards,
            { opacity: 0, y: 56, scale: 0.9, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: t.cardsInDuration,
              stagger: { each: t.cardsInStagger, from: "center" },
              ease: EASE_CARD,
            },
            t.cardsInAt,
          );
        }

        if (assistenzaIcons?.length) {
          tl.to(
            assistenzaIcons,
            {
              scale: 1,
              opacity: 1,
              duration: t.iconPopDuration,
              stagger: { each: t.cardsInStagger, from: "center" },
              ease: EASE_ICON,
            },
            t.cardsInAt + t.iconPopDelay,
          );
        }

        if (tl.duration() === 0) {
          tl.to({}, { duration: 0.2 });
        }
      }),
    [],
  );

  const runAssistenzaHide = useCallback(
    ({ catalogPanelEl, catalogScrollEl }: AssistenzaTransitionParams): Promise<void> =>
      new Promise((resolve) => {
        settleTimelineSlot(contattiSlot.current);
        const { categoriesEl, assistenzaEl, contattiEl } =
          getCatalogSections(catalogPanelEl);
        const categoryPills =
          categoriesEl?.querySelectorAll(".cat-pill-swap");
        const categoryNav = getCategoryNavButtons(categoriesEl);
        const categoryCards =
          categoriesEl?.querySelectorAll("[data-cat-card]");
        const categoryTitles =
          categoriesEl?.querySelectorAll("[data-catalog-title]");
        const assistenzaTitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-title]");
        const assistenzaSubtitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-subtitle]");
        const assistenzaCards =
          assistenzaEl?.querySelectorAll("[data-assistenza-card]").length
            ? assistenzaEl.querySelectorAll("[data-assistenza-card]")
            : assistenzaEl?.querySelectorAll(".feature-swap-card");
        const assistenzaIcons =
          assistenzaEl?.querySelectorAll(".feature-swap-icon");

        finalizeAssistenzaActive(assistenzaEl);
        restoreCategories(categoriesEl);
        releaseInlineMotion(categoryCards);

        if (categoryPills?.length) {
          gsap.set(categoryPills, { opacity: 0, y: -16, scale: 0.88 });
        }
        if (categoryNav?.length) {
          gsap.set(categoryNav, { opacity: 0, scale: 0.82 });
        }
        if (categoriesEl) {
          gsap.set(categoriesEl, {
            opacity: 0,
            y: -56,
            scale: 0.95,
            filter: "blur(12px)",
            pointerEvents: "none",
            visibility: "visible",
            zIndex: 2,
          });
        }
        if (categoryTitles?.length) {
          gsap.set(categoryTitles, { opacity: 0, y: -28, filter: "blur(6px)" });
        }
        if (categoryCards?.length) {
          gsap.set(categoryCards, {
            opacity: 0,
            y: -44,
            scale: 0.9,
            filter: "blur(10px)",
          });
        }

        const tl = beginTimeline(assistenzaSlot.current, () => {
          hideStackedSections(assistenzaEl, contattiEl);
          if (catalogScrollEl) catalogScrollEl.scrollTop = 0;
          releaseInlineMotion(categoryCards);
          if (categoryCards?.length) {
            gsap.set(categoryCards, { clearProps: "all" });
          }
          if (categoryPills?.length) {
            gsap.set(categoryPills, { clearProps: "all" });
          }
          if (categoryNav?.length) {
            gsap.set(categoryNav, { clearProps: "all" });
          }
          if (categoryTitles?.length) {
            gsap.set(categoryTitles, { clearProps: "all" });
          }
          if (catalogPanelEl) {
            gsap.set(catalogPanelEl, { clearProps: "scale,filter" });
          }
          resolve();
        });

        const t = assistenzaHideTiming(isMobileViewport());

        if (assistenzaIcons?.length) {
          tl.to(
            assistenzaIcons,
            {
              scale: 0.55,
              opacity: 0,
              duration: t.cardsOutDuration * 0.55,
              stagger: { each: t.cardsOutStagger, from: "edges" },
              ease: EASE_EXIT,
            },
            t.cardsOutAt,
          );
        }

        if (assistenzaCards?.length) {
          tl.to(
            assistenzaCards,
            {
              opacity: 0,
              y: 48,
              scale: 0.9,
              filter: "blur(10px)",
              duration: t.cardsOutDuration,
              stagger: { each: t.cardsOutStagger, from: "edges" },
              ease: EASE_EXIT,
            },
            t.cardsOutAt,
          );
        }

        if (assistenzaSubtitles?.length) {
          tl.to(
            assistenzaSubtitles,
            {
              opacity: 0,
              y: 18,
              filter: "blur(6px)",
              duration: t.subtitleOutDuration,
              ease: EASE_EXIT,
            },
            t.subtitleOutAt,
          );
        }

        if (assistenzaTitles?.length) {
          tl.to(
            assistenzaTitles,
            {
              opacity: 0,
              y: 28,
              clipPath: "inset(0 0 100% 0)",
              duration: t.titleOutDuration,
              ease: EASE_EXIT,
            },
            t.titleOutAt,
          );
        }

        if (assistenzaEl) {
          tl.to(
            assistenzaEl,
            {
              opacity: 0,
              y: 72,
              scale: 0.94,
              filter: "blur(12px)",
              pointerEvents: "none",
              duration: t.sectionOutDuration,
              ease: EASE_EXIT,
            },
            t.sectionOutAt,
          );
        }

        if (categoriesEl) {
          tl.fromTo(
            categoriesEl,
            {
              opacity: 0,
              y: -56,
              scale: 0.95,
              filter: "blur(12px)",
              pointerEvents: "none",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              pointerEvents: "auto",
              duration: t.sectionInDuration,
              ease: EASE_ENTER,
            },
            t.sectionInAt,
          );
        }

        if (categoryTitles?.length) {
          tl.fromTo(
            categoryTitles,
            { opacity: 0, y: -28, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: t.catTitleInDuration,
              ease: EASE_TITLE,
            },
            t.catTitleInAt,
          );
        }

        if (categoryPills?.length) {
          tl.fromTo(
            categoryPills,
            { opacity: 0, y: -16, scale: 0.88 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: t.pillsInDuration,
              stagger: { each: 0.03, from: "center" },
              ease: EASE_CARD,
            },
            t.pillsInAt,
          );
        }

        if (categoryNav?.length) {
          tl.fromTo(
            categoryNav,
            { opacity: 0, scale: 0.82 },
            {
              opacity: 1,
              scale: 1,
              duration: t.navInDuration,
              stagger: 0.05,
              ease: EASE_CARD,
            },
            t.navInAt,
          );
        }

        if (categoryCards?.length) {
          tl.fromTo(
            categoryCards,
            { opacity: 0, y: -44, scale: 0.9, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: t.cardsInDuration,
              stagger: { each: t.cardsInStagger, from: "center" },
              ease: EASE_CARD,
            },
            t.cardsInAt,
          );
        }

        if (catalogPanelEl) {
          tl.to(
            catalogPanelEl,
            {
              scale: 1,
              filter: "brightness(1)",
              duration: 0.35,
              ease: "power2.out",
            },
            t.sectionInAt + 0.1,
          );
        }
      }),
    [],
  );

  const runContattiReveal = useCallback(
    ({ catalogPanelEl, catalogScrollEl }: AssistenzaTransitionParams): Promise<void> =>
      new Promise((resolve) => {
        settleTimelineSlot(assistenzaSlot.current);
        const { assistenzaEl, contattiEl } = getCatalogSections(catalogPanelEl);
        const assistenzaTitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-title]");
        const assistenzaSubtitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-subtitle]");
        const assistenzaCards =
          assistenzaEl?.querySelectorAll("[data-assistenza-card]").length
            ? assistenzaEl.querySelectorAll("[data-assistenza-card]")
            : assistenzaEl?.querySelectorAll(".feature-swap-card");
        const assistenzaIcons =
          assistenzaEl?.querySelectorAll(".feature-swap-icon");
        const contattiTitles =
          contattiEl?.querySelectorAll("[data-contatti-title]");
        const contattiSubtitles =
          contattiEl?.querySelectorAll("[data-contatti-subtitle]");
        const contattiBlocks =
          contattiEl?.querySelectorAll("[data-contatti-block]");
        const contattiFooter =
          contattiEl?.querySelectorAll("[data-contatti-footer]");
        const contattiSocial =
          contattiEl?.querySelectorAll("[data-contatti-social]");

        primeContattiReveal(contattiEl);
        if (catalogScrollEl) catalogScrollEl.scrollTop = 0;
        releaseInlineMotion(assistenzaCards);

        if (contattiTitles?.length) {
          gsap.set(contattiTitles, {
            opacity: 0,
            y: 44,
            clipPath: "inset(0 0 100% 0)",
          });
        }
        if (contattiSubtitles?.length) {
          gsap.set(contattiSubtitles, { opacity: 0, y: 22, filter: "blur(6px)" });
        }
        if (contattiBlocks?.length) {
          gsap.set(contattiBlocks, {
            opacity: 0,
            y: 56,
            scale: 0.9,
            filter: "blur(10px)",
            transformOrigin: "50% 80%",
          });
        }
        if (contattiFooter?.length) {
          gsap.set(contattiFooter, { opacity: 0, y: 28, filter: "blur(6px)" });
        }
        if (contattiSocial?.length) {
          gsap.set(contattiSocial, { scale: 0.55, opacity: 0 });
        }

        const tl = beginTimeline(contattiSlot.current, () => {
          parkAssistenza(assistenzaEl);
          if (contattiEl) {
            gsap.set(contattiEl, {
              position: "relative",
              visibility: "visible",
              scale: 1,
              filter: "none",
              clearProps: "top,left,right,zIndex,transformOrigin",
            });
          }
          resolve();
        });

        const t = contattiRevealTiming(isMobileViewport());

        if (catalogPanelEl) {
          tl.fromTo(
            catalogPanelEl,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.992,
              filter: "brightness(0.94)",
              duration: t.panelBreatheDuration * 0.45,
              ease: "power2.inOut",
              yoyo: true,
              repeat: 1,
            },
            t.panelBreatheAt,
          );
        }

        if (assistenzaIcons?.length) {
          tl.to(
            assistenzaIcons,
            {
              scale: 0.55,
              opacity: 0,
              duration: t.cardsOutDuration * 0.55,
              stagger: { each: t.cardsOutStagger, from: "edges" },
              ease: EASE_EXIT,
            },
            t.cardsOutAt,
          );
        }

        if (assistenzaCards?.length) {
          tl.to(
            assistenzaCards,
            {
              opacity: 0,
              y: 48,
              scale: 0.9,
              filter: "blur(10px)",
              duration: t.cardsOutDuration,
              stagger: { each: t.cardsOutStagger, from: "edges" },
              ease: EASE_EXIT,
            },
            t.cardsOutAt,
          );
        }

        if (assistenzaSubtitles?.length) {
          tl.to(
            assistenzaSubtitles,
            {
              opacity: 0,
              y: 18,
              filter: "blur(6px)",
              duration: t.subtitleOutDuration,
              ease: EASE_EXIT,
            },
            t.subtitleOutAt,
          );
        }

        if (assistenzaTitles?.length) {
          tl.to(
            assistenzaTitles,
            {
              opacity: 0,
              y: 28,
              clipPath: "inset(0 0 100% 0)",
              duration: t.titleOutDuration,
              ease: EASE_EXIT,
            },
            t.titleOutAt,
          );
        }

        if (assistenzaEl) {
          tl.to(
            assistenzaEl,
            {
              opacity: 0,
              y: 72,
              scale: 0.94,
              filter: "blur(12px)",
              pointerEvents: "none",
              duration: t.sectionOutDuration,
              ease: EASE_EXIT,
            },
            t.sectionOutAt,
          );
          tl.add(
            () => parkAssistenza(assistenzaEl),
            t.sectionOutAt + t.sectionOutDuration * 0.72,
          );
        }

        if (contattiEl) {
          tl.fromTo(
            contattiEl,
            {
              opacity: 0,
              y: 110,
              scale: 0.93,
              filter: "blur(14px)",
              pointerEvents: "none",
              visibility: "visible",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              pointerEvents: "auto",
              visibility: "visible",
              duration: t.sectionInDuration,
              ease: EASE_ENTER,
            },
            t.sectionInAt,
          );
        }

        if (contattiTitles?.length) {
          tl.fromTo(
            contattiTitles,
            { opacity: 0, y: 44, clipPath: "inset(0 0 100% 0)" },
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: t.titleInDuration,
              ease: EASE_TITLE,
            },
            t.titleInAt,
          );
        }

        if (contattiSubtitles?.length) {
          tl.fromTo(
            contattiSubtitles,
            { opacity: 0, y: 22, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: t.subtitleInDuration,
              ease: EASE_TITLE,
            },
            t.subtitleInAt,
          );
        }

        if (contattiBlocks?.length) {
          tl.fromTo(
            contattiBlocks,
            { opacity: 0, y: 56, scale: 0.9, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: t.blocksInDuration,
              stagger: { each: t.blocksInStagger, from: "center" },
              ease: EASE_CARD,
            },
            t.blocksInAt,
          );
        }

        if (contattiSocial?.length) {
          tl.to(
            contattiSocial,
            {
              scale: 1,
              opacity: 1,
              duration: t.socialPopDuration,
              stagger: { each: t.blocksInStagger * 0.35, from: "center" },
              ease: EASE_ICON,
            },
            t.blocksInAt + t.socialPopDelay,
          );
        }

        if (contattiFooter?.length) {
          tl.fromTo(
            contattiFooter,
            { opacity: 0, y: 28, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: t.footerInDuration,
              ease: EASE_TITLE,
            },
            t.footerInAt,
          );
        }

        if (tl.duration() === 0) {
          tl.to({}, { duration: 0.2 });
        }
      }),
    [],
  );

  const runContattiHide = useCallback(
    ({ catalogPanelEl, catalogScrollEl }: AssistenzaTransitionParams): Promise<void> =>
      new Promise((resolve) => {
        settleTimelineSlot(assistenzaSlot.current);
        const { assistenzaEl, contattiEl } = getCatalogSections(catalogPanelEl);
        const assistenzaTitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-title]");
        const assistenzaSubtitles =
          assistenzaEl?.querySelectorAll("[data-assistenza-subtitle]");
        const assistenzaCards =
          assistenzaEl?.querySelectorAll("[data-assistenza-card]").length
            ? assistenzaEl.querySelectorAll("[data-assistenza-card]")
            : assistenzaEl?.querySelectorAll(".feature-swap-card");
        const assistenzaIcons =
          assistenzaEl?.querySelectorAll(".feature-swap-icon");
        const contattiTitles =
          contattiEl?.querySelectorAll("[data-contatti-title]");
        const contattiSubtitles =
          contattiEl?.querySelectorAll("[data-contatti-subtitle]");
        const contattiBlocks =
          contattiEl?.querySelectorAll("[data-contatti-block]");
        const contattiFooter =
          contattiEl?.querySelectorAll("[data-contatti-footer]");
        const contattiSocial =
          contattiEl?.querySelectorAll("[data-contatti-social]");

        const tl = beginTimeline(contattiSlot.current, () => {
          resetContattiHidden(contattiEl);
          finalizeAssistenzaActive(assistenzaEl);
          if (catalogScrollEl) catalogScrollEl.scrollTop = 0;
          releaseInlineMotion(assistenzaCards);
          if (catalogPanelEl) {
            gsap.set(catalogPanelEl, { clearProps: "scale,filter" });
          }
          resolve();
        });

        // beginTimeline may settle a prior contatti reveal and park assistenza again.
        primeAssistenzaReveal(assistenzaEl, 1);
        releaseInlineMotion(assistenzaCards);

        if (assistenzaTitles?.length) {
          gsap.set(assistenzaTitles, {
            opacity: 0,
            y: 44,
            clipPath: "inset(0 0 100% 0)",
          });
        }
        if (assistenzaSubtitles?.length) {
          gsap.set(assistenzaSubtitles, { opacity: 0, y: 22, filter: "blur(6px)" });
        }
        if (assistenzaCards?.length) {
          gsap.set(assistenzaCards, {
            opacity: 0,
            y: 56,
            scale: 0.9,
            filter: "blur(10px)",
            transformOrigin: "50% 80%",
          });
        }
        if (assistenzaIcons?.length) {
          gsap.set(assistenzaIcons, { scale: 0.55, opacity: 0 });
        }
        if (contattiEl) {
          gsap.set(contattiEl, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "none",
            pointerEvents: "auto",
            position: "relative",
            visibility: "visible",
            zIndex: 2,
            clearProps: "top,left,right,transformOrigin",
          });
        }

        const t = contattiHideTiming(isMobileViewport());

        if (contattiBlocks?.length) {
          tl.to(
            contattiBlocks,
            {
              opacity: 0,
              y: 48,
              scale: 0.9,
              filter: "blur(10px)",
              duration: t.blocksOutDuration,
              stagger: { each: t.blocksOutStagger, from: "edges" },
              ease: EASE_EXIT,
            },
            t.blocksOutAt,
          );
        }

        if (contattiSocial?.length) {
          tl.to(
            contattiSocial,
            {
              scale: 0.55,
              opacity: 0,
              duration: t.blocksOutDuration * 0.55,
              stagger: { each: t.blocksOutStagger, from: "edges" },
              ease: EASE_EXIT,
            },
            t.blocksOutAt,
          );
        }

        if (contattiFooter?.length) {
          tl.to(
            contattiFooter,
            {
              opacity: 0,
              y: 18,
              filter: "blur(6px)",
              duration: t.footerOutDuration,
              ease: EASE_EXIT,
            },
            t.footerOutAt,
          );
        }

        if (contattiSubtitles?.length) {
          tl.to(
            contattiSubtitles,
            {
              opacity: 0,
              y: 18,
              filter: "blur(6px)",
              duration: t.subtitleOutDuration,
              ease: EASE_EXIT,
            },
            t.subtitleOutAt,
          );
        }

        if (contattiTitles?.length) {
          tl.to(
            contattiTitles,
            {
              opacity: 0,
              y: 28,
              clipPath: "inset(0 0 100% 0)",
              duration: t.titleOutDuration,
              ease: EASE_EXIT,
            },
            t.titleOutAt,
          );
        }

        if (contattiEl) {
          tl.to(
            contattiEl,
            {
              opacity: 0,
              y: -76,
              scale: 0.95,
              filter: "blur(14px)",
              pointerEvents: "none",
              duration: t.sectionOutDuration,
              ease: EASE_EXIT,
            },
            t.sectionOutAt,
          );
        }

        if (assistenzaEl) {
          tl.fromTo(
            assistenzaEl,
            {
              opacity: 0,
              y: 110,
              scale: 0.93,
              filter: "blur(14px)",
              pointerEvents: "none",
              visibility: "visible",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              pointerEvents: "auto",
              visibility: "visible",
              duration: t.sectionInDuration,
              ease: EASE_ENTER,
            },
            t.sectionInAt,
          );
        }

        if (assistenzaTitles?.length) {
          tl.fromTo(
            assistenzaTitles,
            { opacity: 0, y: 44, clipPath: "inset(0 0 100% 0)" },
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: t.titleInDuration,
              ease: EASE_TITLE,
            },
            t.titleInAt,
          );
        }

        if (assistenzaSubtitles?.length) {
          tl.fromTo(
            assistenzaSubtitles,
            { opacity: 0, y: 22, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: t.subtitleInDuration,
              ease: EASE_TITLE,
            },
            t.subtitleInAt,
          );
        }

        if (assistenzaCards?.length) {
          tl.fromTo(
            assistenzaCards,
            { opacity: 0, y: 56, scale: 0.9, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: t.cardsInDuration,
              stagger: { each: t.cardsInStagger, from: "center" },
              ease: EASE_CARD,
            },
            t.cardsInAt,
          );
        }

        if (assistenzaIcons?.length) {
          tl.to(
            assistenzaIcons,
            {
              scale: 1,
              opacity: 1,
              duration: t.iconPopDuration,
              stagger: { each: t.cardsInStagger, from: "center" },
              ease: EASE_ICON,
            },
            t.cardsInAt + t.iconPopDelay,
          );
        }

        if (catalogPanelEl) {
          tl.to(
            catalogPanelEl,
            {
              scale: 1,
              filter: "brightness(1)",
              duration: 0.35,
              ease: "power2.out",
            },
            t.sectionInAt + 0.1,
          );
        }
      }),
    [],
  );

  return {
    runCatalogReveal,
    runCatalogHide,
    runAssistenzaReveal,
    runAssistenzaHide,
    runContattiReveal,
    runContattiHide,
  };
}