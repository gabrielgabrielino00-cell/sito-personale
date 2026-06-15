import dynamic from "next/dynamic";
import type { CatalogViewMode } from "@/hooks/useHeroCatalogScrollTrigger";
import AssistenzaSection from "@/components/sections/AssistenzaSection";
import ContattiSection from "@/components/sections/ContattiSection";

const CategoryCarousel = dynamic(
  () => import("@/components/sections/CategoryCarousel"),
  { ssr: false },
);

type CatalogOverlayProps = {
  panelRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  viewMode: CatalogViewMode;
  /** Monta categorie/assistenza/contatti solo dopo il primo paint hero */
  contentReady: boolean;
};

const scrollHints: Record<Exclude<CatalogViewMode, "hero">, string> = {
  categories: "Scorri giù per l'assistenza · su per tornare alla home",
  assistenza: "Scorri giù per i contatti · su per tornare alle categorie",
  contatti: "Scorri su per tornare all'assistenza",
};

/** Pannello categorie — bordo superiore allineato alla navbar (HOME, PRODOTTI, …) */
export default function CatalogOverlay({
  panelRef,
  scrollRef,
  viewMode,
  contentReady,
}: CatalogOverlayProps) {
  const hint =
    viewMode === "hero" ? scrollHints.categories : scrollHints[viewMode];

  return (
    <div
      ref={panelRef}
      className="pointer-events-none absolute inset-0 z-40 flex flex-col overflow-hidden border-t border-white/[0.14] bg-[#0a0a0a] opacity-0 shadow-[0_12px_48px_rgba(0,0,0,0.45)]"
      aria-hidden
    >
      <div className="shrink-0 border-b border-white/[0.08] px-4 py-3 md:px-8">
        <p className="text-center text-[10px] font-medium tracking-[0.28em] text-gray-500 uppercase">
          {hint}
        </p>
      </div>
      <div
        ref={scrollRef}
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-hidden overscroll-contain px-1 [scrollbar-width:none] md:px-2 [&::-webkit-scrollbar]:hidden ${
          viewMode === "contatti" ? "pb-6" : "pb-[max(38vh,260px)]"
        }`}
      >
        <div className="catalog-in-overlay relative min-h-full">
          {contentReady ? (
            <>
              <CategoryCarousel />
              <AssistenzaSection embedded />
              <ContattiSection embedded />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}