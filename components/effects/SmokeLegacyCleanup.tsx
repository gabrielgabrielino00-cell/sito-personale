"use client";

import { useEffect } from "react";

const LEGACY_IDS = ["smoke-canvas", "torch-canvas", "smoke-shader-host"];

export default function SmokeLegacyCleanup() {
  useEffect(() => {
    const purge = () => {
      for (const id of LEGACY_IDS) {
        document.getElementById(id)?.remove();
      }
      document
        .querySelectorAll('[id*="smoke"],[id*="torch"]')
        .forEach((node) => node.remove());
    };

    try {
      localStorage.removeItem("e51-torch-enabled");
    } catch {
      /* ignore */
    }

    purge();
    const timer = window.setInterval(purge, 800);

    return () => window.clearInterval(timer);
  }, []);

  return null;
}