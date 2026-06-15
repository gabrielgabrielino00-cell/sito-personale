import { DURATION } from "./easing";

/** Sample of cubic-bezier(0.34, 1.45, 0.64, 1) — iOS spring with overshoot */
function easeIOSSpring(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const x1 = 0.34;
  const y1 = 1.45;
  const x2 = 0.64;
  const y2 = 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleCurveY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleCurveDerivativeX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  let u = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleCurveX(u) - t;
    if (Math.abs(x) < 1e-5) break;
    const dx = sampleCurveDerivativeX(u);
    if (Math.abs(dx) < 1e-5) break;
    u -= x / dx;
  }

  return sampleCurveY(u);
}

function getScrollTargetY(element: Element) {
  return window.scrollY + element.getBoundingClientRect().top;
}

export function springScrollToElement(
  element: Element,
  duration = DURATION.nav,
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const startY = window.scrollY;
  const targetY = getScrollTargetY(element);
  const delta = targetY - startY;

  if (Math.abs(delta) < 2) return Promise.resolve();

  return new Promise((resolve) => {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeIOSSpring(t);

      window.scrollTo(0, startY + delta * eased);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(tick);
  });
}