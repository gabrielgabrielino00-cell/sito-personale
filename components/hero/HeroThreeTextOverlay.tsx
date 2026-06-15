"use client";

import { useEffect, useRef } from "react";
import { Bebas_Neue, Montserrat } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "900",
  display: "swap",
});

type HeroThreeTextOverlayProps = {
  visible: boolean;
};

export default function HeroThreeTextOverlay({
  visible,
}: HeroThreeTextOverlayProps) {
  const embersRef = useRef<HTMLDivElement>(null);
  const word51Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !embersRef.current) return;

    const container = embersRef.current;
    container.replaceChildren();

    for (let i = 0; i < 28; i += 1) {
      const ember = document.createElement("div");
      ember.className = "e51pl-ember";
      const size = 2 + Math.random() * 5;
      const startX = 20 + Math.random() * 60;
      const startY = 40 + Math.random() * 30;
      const dx = (Math.random() - 0.5) * 200;
      const dy = -60 - Math.random() * 140;
      const dur = 2.5 + Math.random() * 3.5;
      const delay = Math.random() * 5;

      ember.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${startX}%;
        top:${startY}%;
        --dx:${dx}px;
        --dy:${dy}px;
        animation-duration:${dur}s;
        animation-delay:${delay}s;
        box-shadow:0 0 ${size * 2}px rgba(255,150,0,0.8);
      `;
      container.appendChild(ember);
    }

    return () => container.replaceChildren();
  }, [visible]);

  useEffect(() => {
    if (!visible || !word51Ref.current) return;

    const el51 = word51Ref.current;
    let bgPos = 0;
    let frameId = 0;

    const animBg = () => {
      bgPos += 0.15;
      el51.style.backgroundPosition = `${bgPos % 200}% 50%`;
      frameId = requestAnimationFrame(animBg);
    };

    frameId = requestAnimationFrame(animBg);
    return () => cancelAnimationFrame(frameId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="e51pl-host pointer-events-none absolute hidden lg:block"
      style={{
        right: "5%",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        width: "clamp(260px, 28vw, 420px)",
      }}
      aria-hidden
    >
      <style>{`
        .e51pl-host {
          background: transparent;
        }

        .e51pl-scene {
          position: relative;
          perspective: 900px;
          perspective-origin: 50% 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
          animation: e51pl-floatY 4s ease-in-out infinite;
        }

        @keyframes e51pl-floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        .e51pl-logo-3d {
          transform-style: preserve-3d;
          animation: e51pl-rotate3d 8s ease-in-out infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @keyframes e51pl-rotate3d {
          0% { transform: rotateY(-18deg) rotateX(4deg); }
          50% { transform: rotateY(18deg) rotateX(-2deg); }
          100% { transform: rotateY(-18deg) rotateX(4deg); }
        }

        .e51pl-word-elettronica {
          font-weight: 900;
          font-size: clamp(28px, 3.2vw, 58px);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          line-height: 1;
          background: linear-gradient(
            160deg,
            #ffffff 0%,
            #d0d8e8 18%,
            #ffffff 30%,
            #8899bb 45%,
            #ffffff 58%,
            #aabbcc 72%,
            #ffffff 85%,
            #ccd4e4 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: url(#e51pl-silverGlow) drop-shadow(0 0 18px rgba(180, 210, 255, 0.25));
          position: relative;
          transform-style: preserve-3d;
          animation: e51pl-entranceTop 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes e51pl-entranceTop {
          from { opacity: 0; transform: translateY(-40px) rotateX(40deg); }
          to { opacity: 1; transform: translateY(0) rotateX(0deg); }
        }

        .e51pl-divider {
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #ff6a00, #ffb347, #ff6a00, transparent);
          margin: 2px 0 -4px;
          opacity: 0;
          animation: e51pl-fadeIn 0.6s 1.2s ease both;
          box-shadow: 0 0 12px 2px rgba(255, 106, 0, 0.5);
        }

        .e51pl-word-51-wrap {
          position: relative;
          display: block;
          line-height: 1;
        }

        .e51pl-word-51 {
          font-size: clamp(88px, 12vw, 200px);
          letter-spacing: -0.02em;
          line-height: 0.85;
          position: relative;
          background: linear-gradient(
            170deg,
            #ffd580 0%,
            #ff8c00 15%,
            #ff6a00 30%,
            #ff4500 50%,
            #ff6a00 65%,
            #ff9500 80%,
            #ffb347 92%,
            #ff6a00 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          filter: url(#e51pl-fireGlow) drop-shadow(0 0 40px rgba(255, 106, 0, 0.8))
            drop-shadow(0 0 80px rgba(255, 60, 0, 0.4));
          animation:
            e51pl-entranceBot 1.4s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both,
            e51pl-shimmer 4s 2s ease-in-out infinite;
        }

        @keyframes e51pl-entranceBot {
          from {
            opacity: 0;
            transform: scale(0.6) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes e51pl-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .e51pl-word-51-shadow {
          position: absolute;
          inset: 0;
          font-size: inherit;
          letter-spacing: -0.02em;
          line-height: 0.85;
          transform: translate(4px, 6px) translateZ(-20px);
          -webkit-text-fill-color: #5a1800;
          z-index: -1;
          pointer-events: none;
          opacity: 0;
          animation: e51pl-fadeIn 0.1s 1.5s both;
        }

        .e51pl-tagline {
          font-weight: 900;
          font-size: clamp(8px, 0.9vw, 12px);
          letter-spacing: 0.55em;
          text-transform: uppercase;
          color: rgba(255, 106, 0, 0.7);
          margin-top: 10px;
          opacity: 0;
          animation: e51pl-fadeIn 0.8s 1.6s ease both;
        }

        @keyframes e51pl-fadeIn {
          to { opacity: 1; }
        }

        .e51pl-halo {
          position: absolute;
          width: 320px;
          height: 160px;
          left: 50%;
          top: 55%;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            ellipse at center,
            rgba(255, 106, 0, 0.35) 0%,
            rgba(255, 60, 0, 0.15) 40%,
            transparent 70%
          );
          filter: blur(28px);
          pointer-events: none;
          z-index: -1;
          animation: e51pl-haloPulse 3.5s ease-in-out infinite;
        }

        @keyframes e51pl-haloPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }

        .e51pl-embers {
          position: absolute;
          inset: -60px;
          pointer-events: none;
          overflow: hidden;
          z-index: -1;
        }

        .e51pl-ember {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, #ffd580, #ff6a00, transparent);
          animation: e51pl-drift linear infinite;
          opacity: 0;
        }

        @keyframes e51pl-drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.4; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .e51pl-scene,
          .e51pl-logo-3d,
          .e51pl-halo,
          .e51pl-word-elettronica,
          .e51pl-word-51,
          .e51pl-divider,
          .e51pl-tagline,
          .e51pl-ember {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        className="absolute h-0 w-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <filter
            id="e51pl-silverGlow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0.6 0.7 1 0 0.1  0.6 0.7 1 0 0.1  0.8 0.9 1 0 0.2  0 0 0 1 0"
              result="colored"
            />
            <feMerge>
              <feMergeNode in="colored" />
              <feMergeNode in="colored" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="e51pl-fireGlow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="6"
              result="blur1"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="14"
              result="blur2"
            />
            <feColorMatrix
              in="blur1"
              type="matrix"
              values="1.5 0.3 0 0 0.1  0.3 0.1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="fire1"
            />
            <feColorMatrix
              in="blur2"
              type="matrix"
              values="1.2 0.2 0 0 0.05  0.2 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
              result="fire2"
            />
            <feMerge>
              <feMergeNode in="fire2" />
              <feMergeNode in="fire1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="e51pl-scene">
        <div className="e51pl-halo" />
        <div ref={embersRef} className="e51pl-embers" />

        <div className="e51pl-logo-3d">
          <div className={`e51pl-word-elettronica ${montserrat.className}`}>
            Elettronica
          </div>
          <div className="e51pl-divider" />
          <div className={`e51pl-word-51-wrap ${bebas.className}`}>
            <div className="e51pl-word-51-shadow">51</div>
            <div ref={word51Ref} className="e51pl-word-51">
              51
            </div>
          </div>
          <div className={`e51pl-tagline ${montserrat.className}`}>
            Tech · Premium · Velocità
          </div>
        </div>
      </div>
    </div>
  );
}