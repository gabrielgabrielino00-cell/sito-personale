"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingCart } from "lucide-react";
import { categories, featuredProducts } from "@/lib/data";
import { buildWhatsAppProductUrl } from "@/lib/cart";
import { useCart } from "@/hooks/useCart";
import { useProductFilter } from "@/hooks/useProductFilter";
import SwapReveal from "@/components/motion/SwapReveal";

export default function ProductCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addProduct } = useCart();
  const { categorySlug } = useProductFilter();

  const filteredProducts = useMemo(() => {
    if (!categorySlug) return featuredProducts;
    return featuredProducts.filter(
      (product) => product.categorySlug === categorySlug,
    );
  }, [categorySlug]);

  const sectionTitle = useMemo(() => {
    if (!categorySlug) return "Prodotti in evidenza";
    const category = categories.find((cat) => cat.slug === categorySlug);
    return category ? `Prodotti — ${category.name}` : "Prodotti in evidenza";
  }, [categorySlug]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 300;
    el.scrollTo({
      left: dir === "left" ? el.scrollLeft - cardWidth : el.scrollLeft + cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#080808] py-16 pb-28 md:py-20 md:pb-32 dark:bg-[#080808]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SwapReveal variant="cloud" className="mb-10 text-center">
          <h2
            data-catalog-title
            className="text-2xl font-bold tracking-wide text-white uppercase md:text-3xl"
          >
            {sectionTitle}
          </h2>
        </SwapReveal>

        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute top-1/2 -left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-all hover:bg-brand hover:text-white md:-left-5 dark:bg-[#1a1a1a] dark:text-gray-300 dark:shadow-black/40"
            aria-label="Precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredProducts.length === 0 ? (
              <p className="px-2 text-sm text-gray-500">
                Nessun prodotto in questa categoria al momento.
              </p>
            ) : (
              filteredProducts.map((product, index) => (
                <SwapReveal
                  key={product.id}
                  variant="rise"
                  delay={index * 70}
                  className="w-[280px] shrink-0"
                >
                  <article
                    data-product-card
                    className="product-swap-card group overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-sm hover:shadow-xl dark:border-white/10 dark:bg-[#141414] dark:shadow-black/20 dark:hover:shadow-brand/10"
                  >
                    <div className="product-swap-media relative aspect-square overflow-hidden bg-[#1a1a1a] p-4 dark:bg-[#1a1a1a]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="280px"
                        loading="lazy"
                        fetchPriority="low"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="border-t border-gray-50 p-5 dark:border-white/5">
                      <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-200">
                        {product.name}
                      </h3>
                      <p className="mb-4 text-xl font-bold text-brand">
                        {product.price}
                      </p>
                      <div className="product-swap-cta flex flex-col gap-2">
                        <a
                          href={buildWhatsAppProductUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Acquista ora
                        </a>
                        <button
                          type="button"
                          onClick={() => addProduct(product)}
                          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-brand hover:text-brand dark:border-white/10 dark:text-gray-400 dark:hover:border-brand dark:hover:text-brand"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Aggiungi al carrello
                        </button>
                      </div>
                    </div>
                  </article>
                </SwapReveal>
              ))
            )}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute top-1/2 -right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-all hover:bg-brand hover:text-white md:-right-5 dark:bg-[#1a1a1a] dark:text-gray-300 dark:shadow-black/40"
            aria-label="Successivo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}