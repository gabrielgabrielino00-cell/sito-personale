"use client";

import { useCallback, useEffect, useState } from "react";

export const CARD_WIDTH = 260;

export type CoverflowMetrics = {
  centerIndex: number;
  offsets: number[];
};

export function useCoverflowCarousel(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  itemCount: number,
) {
  const [metrics, setMetrics] = useState<CoverflowMetrics>({
    centerIndex: 0,
    offsets: Array(itemCount).fill(0),
  });

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const cards = el.querySelectorAll<HTMLElement>("[data-cat-card]");
    if (!cards.length) return;

    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    const offsets: number[] = [];
    let centerIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = (cardCenter - viewportCenter) / card.offsetWidth;
      offsets.push(distance);

      const abs = Math.abs(distance);
      if (abs < minDistance) {
        minDistance = abs;
        centerIndex = index;
      }
    });

    setMetrics({ centerIndex, offsets });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const observer = new ResizeObserver(onScroll);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, [itemCount, scrollRef, update]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;

      const card = el.querySelector<HTMLElement>(
        `[data-cat-card="${index}"]`,
      );
      if (!card) return;

      const target =
        card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2;

      el.scrollTo({
        left: Math.max(0, target),
        behavior: "smooth",
      });
    },
    [scrollRef],
  );

  return { ...metrics, scrollToIndex };
}