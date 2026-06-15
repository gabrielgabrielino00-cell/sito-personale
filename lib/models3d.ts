import type { CategoryIcon } from "./data";

export type Model3DConfig = {
  path: string | null;
  scale?: number;
  maxSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animation?: string;
  boundsMargin?: number;
  followPointer?: boolean;
  bodyTint?: string;
};

export const MODEL_PATHS = {
  iphone: "/models/iphone.glb",
  iphoneLegacy: "/models/apple_iphone_17_pro_max.glb",
  airpods: "/models/airpods_pro.glb",
  washingMachine: "/models/drum_washing_machine.glb",
  ps5: "/models/playstation_ps5__box_7_mb.glb",
} as const;

export const HERO_CAMERA = {
  position: [0, 0.1, 7.6] as [number, number, number],
  lookAt: [0, 0.12, 0] as [number, number, number],
  fov: 34,
};

export const heroModel: Model3DConfig = {
  path: MODEL_PATHS.iphone,
  scale: 1,
  maxSize: 3.35,
  position: [0, 0.18, 0],
  rotation: [0, 0, 0],
};

export const categoryModels: Record<CategoryIcon, Model3DConfig> = {
  accessori: { path: null, scale: 1, maxSize: 2 },
  audio: {
    path: MODEL_PATHS.airpods,
    scale: 1,
    maxSize: 2.05,
    position: [0, -0.22, 0],
    rotation: [0, 0.55, 0],
    animation: "CINEMA_4D_Main",
    boundsMargin: 1.42,
  },
  cuffie: {
    path: MODEL_PATHS.airpods,
    scale: 1,
    maxSize: 2.05,
    position: [0, -0.22, 0],
    rotation: [0, 0.55, 0],
    animation: "CINEMA_4D_Main",
    boundsMargin: 1.42,
  },
  elettrodomestici: {
    path: MODEL_PATHS.washingMachine,
    scale: 1,
    maxSize: 2.35,
    rotation: [0, 0.32, 0],
    animation: "Animation",
  },
  elettronica: { path: null, scale: 1, maxSize: 2 },
  smartphone: {
    path: MODEL_PATHS.iphone,
    scale: 1,
    maxSize: 2.35,
    rotation: [0, 0.4, 0],
    followPointer: true,
  },
  videogames: {
    path: MODEL_PATHS.ps5,
    scale: 1,
    maxSize: 2.3,
    rotation: [0, 0.45, 0],
    boundsMargin: 1.22,
    followPointer: true,
  },
};

export const allModelPaths = [
  ...new Set(
    [heroModel.path, ...Object.values(categoryModels).map((m) => m.path)].filter(
      Boolean,
    ),
  ),
] as string[];