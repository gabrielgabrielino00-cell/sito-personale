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
import TorchOverlay from "@/components/effects/TorchOverlay";

type TorchContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  toggle: () => void;
};

const TorchContext = createContext<TorchContextValue | null>(null);

const STORAGE_KEY = "e51-torch-enabled";

export function TorchProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setEnabledState(stored === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ enabled, setEnabled, toggle }),
    [enabled, setEnabled, toggle],
  );

  return (
    <TorchContext.Provider value={value}>
      {children}
      <TorchOverlay />
    </TorchContext.Provider>
  );
}

export function useTorch() {
  const ctx = useContext(TorchContext);
  if (!ctx) {
    throw new Error("useTorch must be used within TorchProvider");
  }
  return ctx;
}