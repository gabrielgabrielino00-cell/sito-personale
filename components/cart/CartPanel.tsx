"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPriceValue } from "@/lib/cart";

export default function CartPanel() {
  const {
    items,
    itemCount,
    total,
    isOpen,
    closeCart,
    removeProduct,
    setQuantity,
    checkoutWhatsAppUrl,
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Chiudi carrello"
        className="fixed inset-0 z-[60] bg-black/50"
        onClick={closeCart}
      />
      <aside
        aria-label="Carrello"
        className="fixed top-[var(--header-h)] right-0 z-[61] flex h-[calc(100svh-var(--header-h))] w-full max-w-sm flex-col border-l border-gray-100 bg-white dark:border-white/10 dark:bg-[#0a0a0a]"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
            Carrello ({itemCount})
          </h2>
          <button
            type="button"
            aria-label="Chiudi"
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Il carrello è vuoto.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 border-b border-gray-100 pb-4 dark:border-white/10"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#1a1a1a]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-brand">{item.price}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Diminuisci quantità"
                        onClick={() =>
                          setQuantity(
                            item.productId,
                            item.quantity > 1 ? item.quantity - 1 : 1,
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-400"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumenta quantità"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-400"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Rimuovi"
                        onClick={() => removeProduct(item.productId)}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:text-brand"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-gray-100 px-4 py-4 dark:border-white/10">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Totale</span>
              <span className="text-lg font-bold text-brand">
                {formatPriceValue(total)}
              </span>
            </div>
            <a
              href={checkoutWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Ordina su WhatsApp
            </a>
          </div>
        ) : null}
      </aside>
    </>
  );
}