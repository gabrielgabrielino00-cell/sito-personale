"use client";

import { motion, AnimatePresence } from "framer-motion";

const textEase = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

type HeroBrandOverlayProps = {
  visible: boolean;
};

export default function HeroBrandOverlay({ visible }: HeroBrandOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-[var(--header-h)] z-40 h-[var(--hero-brand-h)] border-b border-white/[0.06] bg-[#050505]/95 backdrop-blur-sm"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.5, ease: textEase }}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center px-4 md:px-8">
            <p className="text-[10px] font-medium tracking-[0.32em] text-brand/90 uppercase md:text-[11px] md:tracking-[0.38em]">
              Tech Oggi · Qualità · Velocità
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}