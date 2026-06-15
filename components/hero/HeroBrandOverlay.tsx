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
          className="pointer-events-none absolute inset-x-0 top-[10%] z-[35] flex justify-center px-5 md:top-[12%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: textEase }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.06, ease: textEase }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent px-6 py-7 text-center shadow-[0_0_80px_rgba(249,115,22,0.08)] backdrop-blur-md md:max-w-lg md:px-8 md:py-8"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
              aria-hidden
            />

            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-brand/25 bg-black/40 shadow-[inset_0_0_24px_rgba(249,115,22,0.12)]">
              <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-lg font-bold tracking-[0.2em] text-transparent">
                51
              </span>
            </div>

            <h1 className="relative text-2xl font-bold tracking-[0.14em] text-white uppercase md:text-4xl">
              Elettronica
              <span className="bg-gradient-to-r from-brand to-orange-300 bg-clip-text text-transparent">
                51
              </span>
            </h1>

            <p className="relative mt-3 text-[10px] font-medium tracking-[0.38em] text-brand/90 uppercase md:text-[11px]">
              Tech Oggi · Qualità · Velocità
            </p>

            <div
              className="relative mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              aria-hidden
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}