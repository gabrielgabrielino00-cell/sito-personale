"use client";

import { createContext, useContext } from "react";
import type { ParallaxState } from "@/lib/motion/parallax";
import { PARALLAX_ZERO } from "@/lib/motion/parallax";

type ParallaxContextValue = {
  stateRef: React.RefObject<ParallaxState>;
  mode: "hero" | "category";
  isActive: boolean;
};

const ParallaxCtx = createContext<ParallaxContextValue>({
  stateRef: { current: PARALLAX_ZERO },
  mode: "hero",
  isActive: true,
});

export function ParallaxProvider({
  children,
  stateRef,
  mode,
  isActive,
}: {
  children: React.ReactNode;
  stateRef: React.RefObject<ParallaxState>;
  mode: "hero" | "category";
  isActive: boolean;
}) {
  return (
    <ParallaxCtx.Provider value={{ stateRef, mode, isActive }}>
      {children}
    </ParallaxCtx.Provider>
  );
}

export function useParallaxContext() {
  return useContext(ParallaxCtx);
}