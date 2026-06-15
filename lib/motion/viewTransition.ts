import { DURATION, EASE_SWAP } from "./easing";
import { springScrollToElement } from "./springScroll";

type Point = { x: number; y: number };
type SlideNavDirection = "down" | "up";

function fallbackRun(update: () => void) {
  update();
}

function replayClass(el: Element | null | undefined, className: string) {
  if (!el) return;
  el.classList.remove(className);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(className);
}

export function runViewTransition(update: () => void, origin?: Point) {
  if (typeof document === "undefined") {
    fallbackRun(update);
    return;
  }

  const startVT = document.startViewTransition?.bind(document);
  if (!startVT) {
    fallbackRun(update);
    return;
  }

  const transition = startVT(update);

  if (!origin) return;

  transition.ready
    .then(() => {
      const { innerWidth, innerHeight } = window;
      const radius = Math.hypot(
        Math.max(origin.x, innerWidth - origin.x),
        Math.max(origin.y, innerHeight - origin.y),
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: DURATION.theme,
          easing: EASE_SWAP,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);
}

export function scrollWithSwap(target: Element) {
  const scroll = () =>
    target.scrollIntoView({ behavior: "smooth", block: "start" });

  if (typeof document !== "undefined" && document.startViewTransition) {
    document.startViewTransition(scroll);
  } else {
    scroll();
  }
}

function findSlideWrapper(target: Element) {
  return (
    target.closest(".scroll-swap-down") ??
    target.closest(".site-slide") ??
    target.parentElement?.closest(".scroll-swap-down, .site-slide")
  );
}

export function scrollSlideNav(
  selector: string,
  direction: SlideNavDirection,
  from?: Element | null,
) {
  if (typeof document === "undefined") return;

  const target = document.querySelector(selector);
  if (!target) return;

  const html = document.documentElement;
  const currentSlide = from?.closest(".site-slide");
  const targetSlide = findSlideWrapper(target);
  const navClass = direction === "down" ? "swap-down-nav" : "swap-up-nav";

  html.classList.remove("swap-down-nav", "swap-up-nav", "is-slide-navigating");
  void html.offsetWidth;

  html.classList.add(navClass, "is-slide-navigating");
  html.style.scrollBehavior = "auto";

  replayClass(currentSlide, "is-swap-out");
  replayClass(targetSlide, "is-swap-enter");

  if (direction === "down" && targetSlide) {
    targetSlide.classList.remove("swap-visible");
    void (targetSlide as HTMLElement).offsetWidth;
    targetSlide.classList.add("swap-visible");
  }

  void springScrollToElement(target);

  window.setTimeout(() => {
    currentSlide?.classList.remove("is-swap-out");
    targetSlide?.classList.remove("is-swap-enter");
    html.classList.remove("swap-down-nav", "swap-up-nav", "is-slide-navigating");
    html.style.scrollBehavior = "";
  }, DURATION.nav + 100);
}

/** @deprecated Use scrollSlideNav(selector, "down", from) */
export function scrollSwapDown(selector: string, from?: Element | null) {
  scrollSlideNav(selector, "down", from);
}