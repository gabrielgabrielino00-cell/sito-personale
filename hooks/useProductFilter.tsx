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
import { SITE_FILTER_CATEGORY_EVENT } from "@/lib/siteNavigation";

type ProductFilterContextValue = {
  categorySlug: string | null;
  setCategorySlug: (slug: string | null) => void;
};

const ProductFilterContext = createContext<ProductFilterContextValue | null>(null);

export function ProductFilterProvider({ children }: { children: ReactNode }) {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  useEffect(() => {
    const onFilter = (event: Event) => {
      const detail = (event as CustomEvent<{ categorySlug: string | null }>).detail;
      setCategorySlug(detail.categorySlug);
    };

    document.addEventListener(SITE_FILTER_CATEGORY_EVENT, onFilter);
    return () => document.removeEventListener(SITE_FILTER_CATEGORY_EVENT, onFilter);
  }, []);

  const value = useMemo(
    () => ({
      categorySlug,
      setCategorySlug: useCallback((slug: string | null) => setCategorySlug(slug), []),
    }),
    [categorySlug],
  );

  return (
    <ProductFilterContext.Provider value={value}>
      {children}
    </ProductFilterContext.Provider>
  );
}

export function useProductFilter() {
  const context = useContext(ProductFilterContext);
  if (!context) {
    throw new Error("useProductFilter must be used within ProductFilterProvider");
  }
  return context;
}