export const EASE_SWAP = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_CLOUD = "cubic-bezier(0.45, 0, 0.15, 1)";
export const EASE_SNAP = "cubic-bezier(0.22, 1, 0.36, 1)";
/** iOS-style spring: stiffness ~300, damping ~20, slight overshoot */
export const EASE_IOS_SPRING = "cubic-bezier(0.34, 1.45, 0.64, 1)";
export const EASE_NAV = EASE_IOS_SPRING;

export const DURATION = {
  swap: 720,
  nav: 420,
  cloud: 1100,
  theme: 560,
  hero: 980,
  stagger: 640,
} as const;