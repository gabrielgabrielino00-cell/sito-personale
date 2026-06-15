export type ParallaxState = {
  scroll: number;
  pointerX: number;
  pointerY: number;
  active: number;
};

export const PARALLAX_ZERO: ParallaxState = {
  scroll: 0,
  pointerX: 0,
  pointerY: 0,
  active: 0,
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(current: number, target: number, alpha: number) {
  return current + (target - current) * alpha;
}

export function computeViewportScroll(rect: DOMRect) {
  const viewportMid = window.innerHeight * 0.5;
  const elementMid = rect.top + rect.height * 0.5;
  const range = window.innerHeight * 0.65;
  return clamp((elementMid - viewportMid) / range, -1, 1);
}

export function computeVisibility(rect: DOMRect) {
  const visible =
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return clamp(visible / Math.max(rect.height, 1), 0, 1);
}