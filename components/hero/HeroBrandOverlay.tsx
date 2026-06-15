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
          className="pointer-events-none absolute inset-x-0 top-0 z-[35] border-b border-white/[0.06] bg-gradient-to-b from-[#050505]/95 via-[#050505]/70 to-transparent px-4 pt-3 pb-5 md:px-8 md:pt-4 md:pb-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.65, ease: textEase }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2.5 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/30 bg-black/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                <span className="text-sm font-bold tracking-[0.15em] text-white">
                  51
                </span>
              </div>

              <h1 className="text-lg font-bold tracking-[0.1em] text-white uppercase md:text-xl">
                Elettronica
                <span className="bg-gradient-to-r from-brand to-orange-300 bg-clip-text text-transparent">
                  51
                </span>
              </h1>
            </div>

            <span
              className="hidden h-4 w-px shrink-0 bg-white/15 sm:block"
              aria-hidden
            />

            <p className="text-[10px] font-medium tracking-[0.34em] text-brand/90 uppercase md:text-[11px]">
              Tech Oggi · Qualità · Velocità
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}