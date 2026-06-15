import * as THREE from "three";

export const IPHONE_MODEL_PATH = "/models/iphone.glb";

/** Phone stays fixed — only the camera moves */
export const PHONE = {
  pivotY: 2.58,
  offsetY: 2.28,
  /** ¾ angle on the BACK — screen hidden, camera bump + logo visible */
  fixedRotationY: Math.PI + THREE.MathUtils.degToRad(38),
  lookAt: new THREE.Vector3(0, 2.58, 0),
};

/**
 * Camera enters from the RIGHT, glides to centre, zoom in → dezoom.
 * Azimuth: + = camera on the right side of the phone.
 */
export const CAMERA_DESKTOP = {
  startAzimuth: 1.12,
  endAzimuth: -0.06,
  startRadius: 14.5,
  peakRadius: 5.2,
  endRadius: 6.6,
  startHeight: 2.92,
  peakHeight: 1.82,
  endHeight: 1.72,
  fov: 34,
};

export const CAMERA_MOBILE = {
  startAzimuth: 0.92,
  endAzimuth: -0.08,
  startRadius: 12.5,
  peakRadius: 5.6,
  endRadius: 7.1,
  startHeight: 2.68,
  peakHeight: 1.72,
  endHeight: 1.62,
  fov: 36,
};

/**
 * Phase 1 (0–55%): camera slides right → centre + zoom in
 * Phase 2 (55–100%): dezoom to hero framing
 * Phone: completely static
 */
export const INTRO = {
  duration: 4.5,
  zoomInPortion: 0.55,
  panEase: "power3.out" as const,
  zoomInEase: "power3.in" as const,
  dezoomEase: "power1.inOut" as const,
  glowEase: "power2.out" as const,
};

/** Micro float only — no rotation */
export const IDLE = {
  floatAmplitude: 0.022,
  floatSpeed: 0.38,
  breatheAmplitude: 0.01,
};

export const PARTICLE_COUNT = 110;

/** Camera pull-back on CTA — separate from INTRO, never mutates intro values */
export const CATALOG_DEZOOM = {
  desktop: { radius: 13.8, height: 2.02, duration: 1.8 },
  mobile: { radius: 11.5, height: 1.88, duration: 1.5 },
  tiltX: -0.06,
  radiusEase: "power2.inOut" as const,
  tiltEase: "power1.inOut" as const,
} as const;

export function catalogDezoomTarget(isMobile: boolean) {
  return isMobile ? CATALOG_DEZOOM.mobile : CATALOG_DEZOOM.desktop;
}

/** UI reveal — delayed so the iPhone dezoom stays visible on homepage */
export const CATALOG_REVEAL = {
  desktop: {
    panelAt: 1.05,
    panelDuration: 1.15,
    titlesAt: 1.18,
    titlesDuration: 0.7,
    categoryCardsAt: 1.26,
    categoryCardsDuration: 0.9,
    categoryCardsStagger: 0.1,
    productsAt: 1.58,
    productsDuration: 1.45,
    productCardsAt: 1.72,
    productCardsDuration: 1.1,
    productCardsStagger: 0.12,
  },
  mobile: {
    panelAt: 0.88,
    panelDuration: 1.05,
    titlesAt: 0.98,
    titlesDuration: 0.65,
    categoryCardsAt: 1.06,
    categoryCardsDuration: 0.85,
    categoryCardsStagger: 0.09,
    productsAt: 1.32,
    productsDuration: 1.35,
    productCardsAt: 1.44,
    productCardsDuration: 1.0,
    productCardsStagger: 0.11,
  },
} as const;

export function catalogRevealTiming(isMobile: boolean) {
  return isMobile ? CATALOG_REVEAL.mobile : CATALOG_REVEAL.desktop;
}

/** Categorie ↔ Assistenza — transizione cinematografica a fasi */
export const ASSISTENZA_REVEAL = {
  desktop: {
    panelBreatheAt: 0,
    panelBreatheDuration: 0.22,
    pillsOutAt: 0.06,
    pillsOutDuration: 0.52,
    navOutAt: 0.1,
    navOutDuration: 0.42,
    cardsOutAt: 0.2,
    cardsOutDuration: 0.82,
    cardsOutStagger: 0.068,
    catTitleOutAt: 0.3,
    catTitleOutDuration: 0.58,
    sectionOutAt: 0.38,
    sectionOutDuration: 0.88,
    sectionInAt: 0.54,
    sectionInDuration: 1.48,
    titleInAt: 0.92,
    titleInDuration: 0.98,
    subtitleInAt: 1.08,
    subtitleInDuration: 0.78,
    cardsInAt: 1.2,
    cardsInDuration: 1.12,
    cardsInStagger: 0.13,
    iconPopDelay: 0.28,
    iconPopDuration: 0.62,
  },
  mobile: {
    panelBreatheAt: 0,
    panelBreatheDuration: 0.18,
    pillsOutAt: 0.04,
    pillsOutDuration: 0.45,
    navOutAt: 0.08,
    navOutDuration: 0.36,
    cardsOutAt: 0.16,
    cardsOutDuration: 0.72,
    cardsOutStagger: 0.058,
    catTitleOutAt: 0.24,
    catTitleOutDuration: 0.5,
    sectionOutAt: 0.32,
    sectionOutDuration: 0.78,
    sectionInAt: 0.46,
    sectionInDuration: 1.28,
    titleInAt: 0.78,
    titleInDuration: 0.85,
    subtitleInAt: 0.92,
    subtitleInDuration: 0.68,
    cardsInAt: 1.02,
    cardsInDuration: 0.98,
    cardsInStagger: 0.11,
    iconPopDelay: 0.24,
    iconPopDuration: 0.55,
  },
} as const;

export const ASSISTENZA_HIDE = {
  desktop: {
    cardsOutAt: 0,
    cardsOutDuration: 0.52,
    cardsOutStagger: 0.05,
    titleOutAt: 0.06,
    titleOutDuration: 0.42,
    subtitleOutAt: 0.1,
    subtitleOutDuration: 0.38,
    sectionOutAt: 0.16,
    sectionOutDuration: 0.82,
    sectionInAt: 0.34,
    sectionInDuration: 1.22,
    catTitleInAt: 0.58,
    catTitleInDuration: 0.82,
    cardsInAt: 0.72,
    cardsInDuration: 1.05,
    cardsInStagger: 0.11,
    pillsInAt: 0.62,
    pillsInDuration: 0.55,
    navInAt: 0.66,
    navInDuration: 0.48,
  },
  mobile: {
    cardsOutAt: 0,
    cardsOutDuration: 0.45,
    cardsOutStagger: 0.045,
    titleOutAt: 0.05,
    titleOutDuration: 0.36,
    subtitleOutAt: 0.08,
    subtitleOutDuration: 0.32,
    sectionOutAt: 0.14,
    sectionOutDuration: 0.72,
    sectionInAt: 0.3,
    sectionInDuration: 1.08,
    catTitleInAt: 0.5,
    catTitleInDuration: 0.74,
    cardsInAt: 0.62,
    cardsInDuration: 0.92,
    cardsInStagger: 0.1,
    pillsInAt: 0.54,
    pillsInDuration: 0.48,
    navInAt: 0.58,
    navInDuration: 0.42,
  },
} as const;

export function assistenzaRevealTiming(isMobile: boolean) {
  return isMobile ? ASSISTENZA_REVEAL.mobile : ASSISTENZA_REVEAL.desktop;
}

export function assistenzaHideTiming(isMobile: boolean) {
  return isMobile ? ASSISTENZA_HIDE.mobile : ASSISTENZA_HIDE.desktop;
}

/** Assistenza ↔ Contatti — stesso linguaggio della transizione categorie → assistenza */
export const CONTATTI_REVEAL = {
  desktop: {
    panelBreatheAt: 0,
    panelBreatheDuration: 0.22,
    cardsOutAt: 0,
    cardsOutDuration: 0.52,
    cardsOutStagger: 0.05,
    titleOutAt: 0.06,
    titleOutDuration: 0.42,
    subtitleOutAt: 0.1,
    subtitleOutDuration: 0.38,
    sectionOutAt: 0.16,
    sectionOutDuration: 0.82,
    sectionInAt: 0.34,
    sectionInDuration: 1.48,
    titleInAt: 0.72,
    titleInDuration: 0.98,
    subtitleInAt: 0.88,
    subtitleInDuration: 0.78,
    blocksInAt: 1,
    blocksInDuration: 1.12,
    blocksInStagger: 0.13,
    footerInAt: 1.35,
    footerInDuration: 0.65,
    socialPopDelay: 0.28,
    socialPopDuration: 0.62,
  },
  mobile: {
    panelBreatheAt: 0,
    panelBreatheDuration: 0.18,
    cardsOutAt: 0,
    cardsOutDuration: 0.45,
    cardsOutStagger: 0.045,
    titleOutAt: 0.05,
    titleOutDuration: 0.36,
    subtitleOutAt: 0.08,
    subtitleOutDuration: 0.32,
    sectionOutAt: 0.14,
    sectionOutDuration: 0.72,
    sectionInAt: 0.3,
    sectionInDuration: 1.28,
    titleInAt: 0.62,
    titleInDuration: 0.85,
    subtitleInAt: 0.76,
    subtitleInDuration: 0.68,
    blocksInAt: 0.86,
    blocksInDuration: 0.98,
    blocksInStagger: 0.11,
    footerInAt: 1.18,
    footerInDuration: 0.55,
    socialPopDelay: 0.24,
    socialPopDuration: 0.55,
  },
} as const;

export const CONTATTI_HIDE = {
  desktop: {
    blocksOutAt: 0,
    blocksOutDuration: 0.52,
    blocksOutStagger: 0.05,
    footerOutAt: 0.08,
    footerOutDuration: 0.38,
    titleOutAt: 0.12,
    titleOutDuration: 0.42,
    subtitleOutAt: 0.16,
    subtitleOutDuration: 0.38,
    sectionOutAt: 0.22,
    sectionOutDuration: 0.82,
    sectionInAt: 0.4,
    sectionInDuration: 1.48,
    titleInAt: 0.78,
    titleInDuration: 0.98,
    subtitleInAt: 0.94,
    subtitleInDuration: 0.78,
    cardsInAt: 1.06,
    cardsInDuration: 1.12,
    cardsInStagger: 0.13,
    iconPopDelay: 0.28,
    iconPopDuration: 0.62,
  },
  mobile: {
    blocksOutAt: 0,
    blocksOutDuration: 0.45,
    blocksOutStagger: 0.045,
    footerOutAt: 0.06,
    footerOutDuration: 0.32,
    titleOutAt: 0.1,
    titleOutDuration: 0.36,
    subtitleOutAt: 0.14,
    subtitleOutDuration: 0.32,
    sectionOutAt: 0.18,
    sectionOutDuration: 0.72,
    sectionInAt: 0.34,
    sectionInDuration: 1.28,
    titleInAt: 0.66,
    titleInDuration: 0.85,
    subtitleInAt: 0.8,
    subtitleInDuration: 0.68,
    cardsInAt: 0.92,
    cardsInDuration: 0.98,
    cardsInStagger: 0.11,
    iconPopDelay: 0.24,
    iconPopDuration: 0.55,
  },
} as const;

export function contattiRevealTiming(isMobile: boolean) {
  return isMobile ? CONTATTI_REVEAL.mobile : CONTATTI_REVEAL.desktop;
}

export function contattiHideTiming(isMobile: boolean) {
  return isMobile ? CONTATTI_HIDE.mobile : CONTATTI_HIDE.desktop;
}

export function cameraPositionFromOrbit(
  azimuth: number,
  radius: number,
  height: number,
  lookAt = PHONE.lookAt,
) {
  return new THREE.Vector3(
    lookAt.x + Math.sin(azimuth) * radius,
    height,
    lookAt.z + Math.cos(azimuth) * radius,
  );
}

/** Canvas / R3F camera — must match intro t=0 so there is no flash on first paint */
export function introCameraProps(isMobile: boolean) {
  const cam = isMobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
  const pos = cameraPositionFromOrbit(
    cam.startAzimuth,
    cam.startRadius,
    cam.startHeight,
  );
  return {
    fov: cam.fov,
    near: 0.1,
    far: 80,
    position: [pos.x, pos.y, pos.z] as [number, number, number],
  };
}