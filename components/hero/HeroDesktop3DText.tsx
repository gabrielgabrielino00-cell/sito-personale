"use client";

import { motion, AnimatePresence } from "framer-motion";

const ORANGE = "#FF6A00";
const EXTRUDE_LAYERS = 16;

function buildExtrusionShadow(): string {
  const layers: string[] = [];
  for (let i = 1; i <= EXTRUDE_LAYERS; i += 1) {
    const shade = Math.max(0, 28 - i * 1.6);
    layers.push(`${i}px ${i}px 0 rgb(${shade} ${Math.floor(shade * 0.35)} 0)`);
  }
  layers.push(
    `${EXTRUDE_LAYERS + 2}px ${EXTRUDE_LAYERS + 2}px 24px rgba(0, 0, 0, 0.85)`,
  );
  return layers.join(", ");
}

const extrusionShadow = buildExtrusionShadow();

type HeroDesktop3DTextProps = {
  visible: boolean;
};

export default function HeroDesktop3DText({ visible }: HeroDesktop3DTextProps) {
  return (
    <>
      <style>{`
        @keyframes hero-desktop-3d-glow {
          0%, 100% {
            filter: drop-shadow(0 0 14px rgba(255, 106, 0, 0.28));
          }
          50% {
            filter: drop-shadow(0 0 36px rgba(255, 106, 0, 0.72))
              drop-shadow(0 0 72px rgba(255, 106, 0, 0.22));
          }
        }

        .hero-desktop-3d-text__face {
          text-shadow: ${extrusionShadow};
        }

        .hero-desktop-3d-text__glow {
          animation: hero-desktop-3d-glow 3.6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-desktop-3d-text__tilt {
            animation: none !important;
          }
          .hero-desktop-3d-text__glow {
            animation: none !important;
          }
        }
      `}</style>

      <AnimatePresence>
        {visible ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[34] hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            aria-hidden
          >
            <div
              className="absolute top-1/2 right-[5%] xl:right-[7%] 2xl:right-[9%]"
              style={{ perspective: "900px" }}
            >
              <motion.div
                className="hero-desktop-3d-text__tilt hero-desktop-3d-text__glow -translate-y-1/2"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: [-10, 10, -10], rotateX: [2, -2, 2] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <span
                    className="hero-desktop-3d-text__face block font-bold uppercase leading-none tracking-[0.18em] text-[clamp(2.4rem,3.6vw,3.75rem)]"
                    style={{
                      color: ORANGE,
                      fontFamily: "var(--font-poppins), system-ui, sans-serif",
                    }}
                  >
                    Tech
                  </span>
                  <span
                    className="hero-desktop-3d-text__face block font-bold uppercase leading-none tracking-[0.22em] text-[clamp(2.8rem,4.2vw,4.5rem)]"
                    style={{
                      color: ORANGE,
                      fontFamily: "var(--font-poppins), system-ui, sans-serif",
                    }}
                  >
                    Oggi
                  </span>
                  <span
                    className="mt-3 block text-[10px] font-medium uppercase tracking-[0.42em] text-white/35"
                    style={{
                      fontFamily: "var(--font-poppins), system-ui, sans-serif",
                      transform: "translateZ(12px)",
                    }}
                  >
                    Elettronica51
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}