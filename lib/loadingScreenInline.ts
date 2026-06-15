export const LOADING_SCREEN_STYLE = `
/* === LOADING SCREEN — added === */
body.ls-loading-active {
  pointer-events: none;
}

#ls-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050505;
  pointer-events: all;
  opacity: 1;
}

#ls-overlay .ls-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}

#ls-overlay .ls-logo-wrap {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
  filter: blur(8px);
  animation: ls-brand-in 1.05s cubic-bezier(0.16, 1, 0.3, 1) 60ms forwards;
}

#ls-overlay .ls-logo {
  width: clamp(12rem, 40vw, 17rem) !important;
  height: auto !important;
  color: #fafafa;
}

#ls-overlay .ls-progress-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  width: min(17rem, 72vw);
  margin-top: 1.6rem;
  opacity: 0;
  animation: ls-progress-in 600ms cubic-bezier(0.16, 1, 0.3, 1) 680ms forwards;
}

#ls-overlay .ls-progress-track {
  position: relative;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

#ls-overlay .ls-progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(249, 115, 22, 0.5) 0%,
    #f97316 50%,
    #fb923c 100%
  );
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.4);
  transform: scaleX(0);
  transform-origin: left center;
  will-change: transform;
}

#ls-overlay .ls-progress-label {
  font-family: var(--font-poppins), system-ui, sans-serif;
  font-size: 10px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(249, 115, 22, 0.75);
}

#ls-overlay .ls-progress-label::after {
  content: "%";
  margin-left: 1px;
  opacity: 0.65;
}

@keyframes ls-brand-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes ls-progress-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;