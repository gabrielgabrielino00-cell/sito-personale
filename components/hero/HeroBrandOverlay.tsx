"use client";

import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/brand/Logo";

const textEase = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

type HeroBrandOverlayProps = {
  visible: boolean;
};

export default function HeroBrandOverlay({ visible }: HeroBrandOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[12%] z-[35] flex flex-col items-center px-6 text-center md:top-[14%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: textEase }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: textEase }}
          >
            <Logo size="xl" className="h-14 text-white md:h-16" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: textEase }}
            className="mt-4 text-xs font-semibold tracking-[0.32em] text-brand uppercase md:text-sm"
          >
            Tech Oggi
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: textEase }}
            className="sr-only"
          >
            Elettronica51
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36, ease: textEase }}
            className="mt-3 max-w-xs text-sm leading-relaxed text-gray-300 md:max-w-md md:text-base"
          >
            Qualità, Convenienza, Velocità — Tutto Qui.
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}