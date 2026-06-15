import type { Product } from "@/lib/data";

export type CartItem = {
  productId: number;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  quantity: number;
};

const STORAGE_KEY = "elettronica51-cart";
const WHATSAPP_PHONE = "393335210878";

export function parsePriceValue(price: string): number {
  const normalized = price.replace(/[^\d,]/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function formatPriceValue(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

export function productToCartItem(product: Product, quantity = 1): CartItem {
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    priceValue: product.priceValue,
    image: product.image,
    quantity,
  };
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function buildWhatsAppProductUrl(product: Product, quantity = 1): string {
  const text = encodeURIComponent(
    `Ciao Elettronica51! Vorrei acquistare:\n\n• ${product.name}\nQuantità: ${quantity}\nPrezzo: ${product.price}\n\nGrazie!`,
  );
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`;
}

export function buildWhatsAppCartUrl(items: CartItem[]): string {
  if (!items.length) {
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}`;
  }

  const lines = items.map(
    (item) =>
      `• ${item.name} × ${item.quantity} — ${formatPriceValue(item.priceValue * item.quantity)}`,
  );
  const total = formatPriceValue(cartTotal(items));
  const text = encodeURIComponent(
    `Ciao Elettronica51! Vorrei confermare questo ordine:\n\n${lines.join("\n")}\n\n*Totale: ${total}*\n\nGrazie!`,
  );
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`;
}