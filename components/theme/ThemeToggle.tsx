"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Attiva modalità giorno" : "Attiva modalità notte"}
      className="theme-swap-btn relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-brand transition-all hover:scale-105 dark:border-brand/30 dark:bg-brand/10 dark:text-brand-light dark:hover:bg-brand/20"
    >
      <Sun
        className={`theme-swap-icon theme-swap-icon--sun absolute h-4 w-4 ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`theme-swap-icon theme-swap-icon--moon absolute h-4 w-4 ${
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}