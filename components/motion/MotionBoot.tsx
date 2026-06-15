"use client";

import { useEffect } from "react";

export default function MotionBoot() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-motion", "idle");

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => root.setAttribute("data-motion", "boot"));
    });

    return () => {
      cancelAnimationFrame(id);
      root.setAttribute("data-motion", "idle");
    };
  }, []);

  return null;
}