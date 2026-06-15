"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildWhatsAppCartUrl,
  cartItemCount,
  cartTotal,
  productToCartItem,
  readCart,
  writeCart,
  type CartItem,
} from "@/lib/cart";
import type { Product } from "@/lib/data";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  checkoutWhatsAppUrl: string;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCart(items);
  }, [hydrated, items]);

  const addProduct = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (!existing) {
        return [...current, productToCartItem(product, quantity)];
      }
      return current.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    });
    setIsOpen(true);
  }, []);

  const removeProduct = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    const safeQty = Math.max(1, Math.min(99, Math.floor(quantity)));
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQty } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: cartItemCount(items),
      total: cartTotal(items),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((open) => !open),
      addProduct,
      removeProduct,
      setQuantity,
      clearCart,
      checkoutWhatsAppUrl: buildWhatsAppCartUrl(items),
    }),
    [addProduct, clearCart, isOpen, items, removeProduct, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}