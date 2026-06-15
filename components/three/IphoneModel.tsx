"use client";

/**
 * IphoneModel — GLTF + tech particles + GSAP intro timeline.
 *
 * Timeline (4.5s, all tracks run in parallel unless noted):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ phoneRotationY  : fixed ¾ angle (no movement)               │
 * │ cameraAzimuth   : right side → centre (power3.out)          │
 * │ cameraRadius    : far → close → final (zoom in / dezoom)    │
 * │ cameraHeight    : follows radius                            │
 * │ screenGlow      : 0 → 1 (delayed)                           │
 * └─────────────────────────────────────────────────────────────┘
 * After intro: phone stays still, micro float only.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import {
  CAMERA_DESKTOP,
  CAMERA_MOBILE,
  CATALOG_DEZOOM,
  IDLE,
  INTRO,
  IPHONE_MODEL_PATH,
  PARTICLE_COUNT,
  PHONE,
} from "@/lib/cinematic/config";

useGLTF.preload(IPHONE_MODEL_PATH);

// ─── Shared animation state (mutated by GSAP, read in useFrame) ───

export type PremiumAnimState = {
  timelineProgress: { value: number };
  phoneRotationY: { value: number };
  cameraAzimuth: { value: number };
  cameraRadius: { value: number };
  cameraHeight: { value: number };
  screenGlow: { value: number };
};

export type CatalogCamState = {
  radius: number;
  height: number;
  tiltX: number;
};

type PremiumAnimContextValue = {
  anim: PremiumAnimState;
  introComplete: boolean;
  isMobile: boolean;
  catalogCam: React.RefObject<CatalogCamState>;
  catalogDezoomActive: boolean;
  catalogDezoomDone: boolean;
  triggerCatalogDezoom: () => Promise<void>;
};

const PremiumAnimContext = createContext<PremiumAnimContextValue | null>(null);

export function usePremiumAnim() {
  const ctx = useContext(PremiumAnimContext);
  if (!ctx) throw new Error("usePremiumAnim must be used inside PremiumHeroRig");
  return ctx;
}

// ─── GSAP timeline builder ───

function buildIntroTimeline(
  anim: PremiumAnimState,
  isMobile: boolean,
  onComplete: () => void,
  invalidate?: () => void,
) {
  const cam = isMobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
  const bump = () => invalidate?.();
  const zoomInDur = INTRO.duration * INTRO.zoomInPortion;
  const dezoomDur = INTRO.duration - zoomInDur;

  anim.timelineProgress.value = 0;
  anim.phoneRotationY.value = PHONE.fixedRotationY;
  anim.cameraAzimuth.value = cam.startAzimuth;
  anim.cameraRadius.value = cam.startRadius;
  anim.cameraHeight.value = cam.startHeight;
  anim.screenGlow.value = 0;

  const tl = gsap.timeline({ onComplete });
  const panDur = INTRO.duration * 0.72;

  tl.to(
    anim.timelineProgress,
    { value: 1, duration: INTRO.duration, ease: INTRO.panEase, onUpdate: bump },
    0,
  )
    .to(
      anim.cameraAzimuth,
      {
        value: cam.endAzimuth,
        duration: panDur,
        ease: INTRO.panEase,
        onUpdate: bump,
      },
      0,
    )
    .to(
      anim.cameraRadius,
      { value: cam.peakRadius, duration: zoomInDur, ease: INTRO.zoomInEase, onUpdate: bump },
      0,
    )
    .to(
      anim.cameraHeight,
      { value: cam.peakHeight, duration: zoomInDur, ease: INTRO.zoomInEase, onUpdate: bump },
      0,
    )
    .to(
      anim.cameraRadius,
      { value: cam.endRadius, duration: dezoomDur, ease: INTRO.dezoomEase, onUpdate: bump },
      zoomInDur,
    )
    .to(
      anim.cameraHeight,
      { value: cam.endHeight, duration: dezoomDur, ease: INTRO.dezoomEase, onUpdate: bump },
      zoomInDur,
    )
    .to(
      anim.screenGlow,
      {
        value: 1,
        duration: INTRO.duration * 0.7,
        ease: INTRO.glowEase,
        onUpdate: bump,
      },
      INTRO.duration * 0.22,
    );

  bump();
  return tl;
}

// ─── Soft bokeh texture (replaces harsh square GL points) ───

function createBokehTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.12, "rgba(220,240,255,0.45)");
  g.addColorStop(0.38, "rgba(140,190,230,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

// ─── Ambient bokeh — halo behind the phone, never on top ───

function TechParticles() {
  const { anim } = usePremiumAnim();
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);

  const { base, texture } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT * 2);
    const pivot = PHONE.pivotY;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 5.5 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2.8;
      const zBias = -1.5 - Math.random() * 2.5;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height + pivot;
      positions[i * 3 + 2] = Math.sin(angle) * radius + zBias;

      const cool = Math.random() > 0.55;
      colors[i * 3] = cool ? 0.55 : 0.82;
      colors[i * 3 + 1] = cool ? 0.78 : 0.86;
      colors[i * 3 + 2] = cool ? 0.95 : 0.92;

      seeds[i * 2] = Math.random() * Math.PI * 2;
      seeds[i * 2 + 1] = 0.1 + Math.random() * 0.18;
    }

    return { base: { positions, colors, seeds, pivot }, texture: createBokehTexture() };
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const progress = anim.timelineProgress.value;
    const t = state.clock.elapsedTime;
    const pos = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const drift = 0.08 + progress * 0.14;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = base.seeds[i * 2];
      const speed = base.seeds[i * 2 + 1];
      const bx = base.positions[i * 3];
      const by = base.positions[i * 3 + 1];
      const bz = base.positions[i * 3 + 2];
      const radius = Math.hypot(bx, bz);
      const angle = Math.atan2(bx, bz) + t * speed * drift;

      pos.setXYZ(
        i,
        Math.sin(angle) * radius,
        by + Math.sin(t * 0.4 + seed) * 0.1,
        Math.cos(angle) * radius,
      );
    }

    pos.needsUpdate = true;
    if (materialRef.current) {
      materialRef.current.opacity = 0.1 + progress * 0.08;
      materialRef.current.size = 0.14 + progress * 0.04;
    }
  });

  return (
    <points ref={pointsRef} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[base.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[base.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        map={texture}
        size={0.14}
        vertexColors
        transparent
        opacity={0.12}
        depthWrite={false}
        depthTest
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

// ─── iPhone mesh ───

const TEXTURE_KEYS = [
  "map",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "aoMap",
  "emissiveMap",
] as const;

function enhanceTextures(
  object: THREE.Object3D,
  maxAnisotropy: number,
) {
  object.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mats = (child as THREE.Mesh).material;
    const list = Array.isArray(mats) ? mats : [mats];

    for (const mat of list) {
      if (!mat) continue;
      const m = mat as THREE.MeshStandardMaterial;
      for (const key of TEXTURE_KEYS) {
        const tex = m[key];
        if (tex && (tex as THREE.Texture).isTexture) {
          const t = tex as THREE.Texture;
          t.anisotropy = maxAnisotropy;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = true;
          t.needsUpdate = true;
        }
      }
    }
  });
}

function cloneWithMaterials(scene: THREE.Object3D, maxAnisotropy: number) {
  const root = scene.clone(true);
  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => m.clone());
    } else if (mesh.material) {
      mesh.material = mesh.material.clone();
    }
  });
  enhanceTextures(root, maxAnisotropy);
  return root;
}

function fitModel(scene: THREE.Object3D) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  scene.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  scene.scale.setScalar(maxDim > 0 ? 3.15 / maxDim : 1);
  scene.position.y += 0.32;
}

function isScreenMesh(mesh: THREE.Mesh) {
  const n = mesh.name.toLowerCase();
  return n.includes("screen") || n.includes("display") || n.includes("lcd");
}

function IphoneMesh({ onLoaded }: { onLoaded: () => void }) {
  const { anim } = usePremiumAnim();
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const screenMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const loadedOnce = useRef(false);
  const { scene } = useGLTF(IPHONE_MODEL_PATH);
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

  const model = useMemo(() => {
    const copy = cloneWithMaterials(scene, maxAnisotropy);
    fitModel(copy);
    screenMats.current = [];
    let fallback: THREE.MeshStandardMaterial | undefined;

    copy.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (isScreenMesh(mesh)) {
        mat.emissive = new THREE.Color("#5eb8f0");
        mat.emissiveIntensity = 0;
        mat.roughness = 0.18;
        screenMats.current.push(mat);
      } else if (mat.metalness > 0.35) {
        mat.envMapIntensity = 0.88;
        mat.roughness = THREE.MathUtils.clamp(mat.roughness, 0.38, 0.52);
        mat.metalness = THREE.MathUtils.clamp(mat.metalness, 0.62, 0.78);
      }

      mesh.geometry.computeBoundingBox();
      const box = mesh.geometry.boundingBox;
      if (!box) return;
      const s = box.getSize(new THREE.Vector3());
      const thin = Math.min(s.x, s.y, s.z);
      if (thin < 0.09) fallback = mat;
    });

    if (!screenMats.current.length && fallback) {
      fallback.emissive = new THREE.Color("#5eb8f0");
      fallback.emissiveIntensity = 0;
      screenMats.current.push(fallback);
    }

    return copy;
  }, [scene, maxAnisotropy]);

  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    onLoaded();
  }, [onLoaded]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    groupRef.current.rotation.y = PHONE.fixedRotationY;
    groupRef.current.rotation.x =
      Math.sin(t * IDLE.floatSpeed * 0.65) * IDLE.breatheAmplitude;
    groupRef.current.position.y =
      PHONE.offsetY + Math.sin(t * IDLE.floatSpeed) * IDLE.floatAmplitude;

    // Back-facing hero — keep screen glow minimal
    const glow = anim.screenGlow.value;
    for (const mat of screenMats.current) {
      mat.emissiveIntensity = THREE.MathUtils.lerp(0, 0.12, glow);
    }
  });

  return (
    <group ref={groupRef} renderOrder={1}>
      <primitive object={model} />
    </group>
  );
}

// ─── Public rig: context + model + particles + timeline kick-off ───

type PremiumHeroRigProps = {
  isMobile: boolean;
  onModelLoaded: () => void;
  onIntroComplete: () => void;
  onSceneReady?: () => void;
  invalidate?: () => void;
  onDezoomReady?: (api: {
    triggerCatalogDezoom: () => Promise<void>;
    triggerCatalogZoomIn: () => Promise<void>;
  }) => void;
  children?: ReactNode;
};

function syncAnimToCameraPreset(anim: PremiumAnimState, isMobile: boolean) {
  const cam = isMobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
  anim.timelineProgress.value = 0;
  anim.phoneRotationY.value = PHONE.fixedRotationY;
  anim.cameraAzimuth.value = cam.startAzimuth;
  anim.cameraRadius.value = cam.startRadius;
  anim.cameraHeight.value = cam.startHeight;
  anim.screenGlow.value = 0;
}

export function PremiumHeroRig({
  isMobile,
  onModelLoaded,
  onIntroComplete,
  onSceneReady,
  invalidate,
  onDezoomReady,
  children,
}: PremiumHeroRigProps) {
  const anim = useRef<PremiumAnimState>({
    timelineProgress: { value: 0 },
    phoneRotationY: { value: PHONE.fixedRotationY },
    cameraAzimuth: { value: CAMERA_DESKTOP.startAzimuth },
    cameraRadius: { value: CAMERA_DESKTOP.startRadius },
    cameraHeight: { value: CAMERA_DESKTOP.startHeight },
    screenGlow: { value: 0 },
  });
  const catalogCam = useRef<CatalogCamState>({
    radius: CAMERA_DESKTOP.endRadius,
    height: CAMERA_DESKTOP.endHeight,
    tiltX: 0,
  });
  const [modelReady, setModelReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [catalogDezoomActive, setCatalogDezoomActive] = useState(false);
  const [catalogDezoomDone, setCatalogDezoomDone] = useState(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const catalogDezoomTimeline = useRef<gsap.core.Timeline | null>(null);
  const introStartedRef = useRef(false);
  const sceneReportedRef = useRef(false);
  const isMobileRef = useRef(isMobile);
  const onSceneReadyRef = useRef(onSceneReady);
  const onIntroCompleteRef = useRef(onIntroComplete);

  isMobileRef.current = isMobile;
  onSceneReadyRef.current = onSceneReady;
  onIntroCompleteRef.current = onIntroComplete;

  const handleLoaded = useCallback(() => {
    setModelReady(true);
    onModelLoaded();
  }, [onModelLoaded]);

  const handleIntroDone = useCallback(() => {
    setIntroComplete(true);
    onIntroCompleteRef.current();
  }, []);

  useEffect(() => {
    syncAnimToCameraPreset(anim.current, isMobile);
    invalidate?.();
  }, [isMobile, invalidate]);

  useEffect(() => {
    if (!modelReady || sceneReportedRef.current) return;
    sceneReportedRef.current = true;

    let outerFrame = 0;
    let innerFrame = 0;
    outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        onSceneReadyRef.current?.();
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [modelReady]);

  useEffect(() => {
    if (!modelReady) return;

    const startIntro = () => {
      if (introStartedRef.current) return;
      introStartedRef.current = true;

      const mobile = isMobileRef.current;
      timeline.current?.kill();
      syncAnimToCameraPreset(anim.current, mobile);
      timeline.current = buildIntroTimeline(
        anim.current,
        mobile,
        handleIntroDone,
        invalidate,
      );
      invalidate?.();
    };

    if (
      typeof document !== "undefined" &&
      document.getElementById("ls-overlay")
    ) {
      document.addEventListener("loadingComplete", startIntro, { once: true });
      return () =>
        document.removeEventListener("loadingComplete", startIntro);
    }

    startIntro();
    return undefined;
  }, [modelReady]);

  useEffect(() => {
    if (!introComplete) return;
    const cam = isMobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
    catalogCam.current.radius = cam.endRadius;
    catalogCam.current.height = cam.endHeight;
    catalogCam.current.tiltX = 0;
  }, [introComplete, isMobile]);

  const triggerCatalogDezoom = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (!introComplete || catalogDezoomDone) {
          resolve();
          return;
        }

        const target = isMobile ? CATALOG_DEZOOM.mobile : CATALOG_DEZOOM.desktop;
        const { duration } = target;
        const bump = () => invalidate?.();

        catalogDezoomTimeline.current?.kill();
        setCatalogDezoomActive(true);

        catalogDezoomTimeline.current = gsap.timeline({
          onComplete: () => {
            setCatalogDezoomActive(false);
            setCatalogDezoomDone(true);
            resolve();
          },
        });

        catalogDezoomTimeline.current
          .to(
            catalogCam.current,
            {
              radius: target.radius,
              height: target.height,
              duration,
              ease: CATALOG_DEZOOM.radiusEase,
              onUpdate: bump,
            },
            0,
          )
          .to(
            catalogCam.current,
            {
              tiltX: CATALOG_DEZOOM.tiltX,
              duration,
              ease: CATALOG_DEZOOM.tiltEase,
              onUpdate: bump,
            },
            0,
          );

        bump();
      }),
    [catalogDezoomDone, introComplete, invalidate, isMobile],
  );

  const triggerCatalogZoomIn = useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (!introComplete) {
          resolve();
          return;
        }

        const cam = isMobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
        const state = catalogCam.current;
        const atRest =
          Math.abs(state.radius - cam.endRadius) < 0.08 &&
          Math.abs(state.height - cam.endHeight) < 0.08 &&
          Math.abs(state.tiltX) < 0.01;

        if (atRest && !catalogDezoomDone) {
          resolve();
          return;
        }

        const target = isMobile ? CATALOG_DEZOOM.mobile : CATALOG_DEZOOM.desktop;
        const { duration } = target;
        const bump = () => invalidate?.();

        catalogDezoomTimeline.current?.kill();
        setCatalogDezoomActive(true);

        catalogDezoomTimeline.current = gsap.timeline({
          onComplete: () => {
            setCatalogDezoomActive(false);
            setCatalogDezoomDone(false);
            state.radius = cam.endRadius;
            state.height = cam.endHeight;
            state.tiltX = 0;
            resolve();
          },
        });

        catalogDezoomTimeline.current
          .to(
            state,
            {
              radius: cam.endRadius,
              height: cam.endHeight,
              duration,
              ease: CATALOG_DEZOOM.radiusEase,
              onUpdate: bump,
            },
            0,
          )
          .to(
            state,
            {
              tiltX: 0,
              duration,
              ease: CATALOG_DEZOOM.tiltEase,
              onUpdate: bump,
            },
            0,
          );

        bump();
      }),
    [catalogDezoomDone, introComplete, invalidate, isMobile],
  );

  useEffect(() => {
    onDezoomReady?.({ triggerCatalogDezoom, triggerCatalogZoomIn });
  }, [onDezoomReady, triggerCatalogDezoom, triggerCatalogZoomIn]);

  const ctx = useMemo(
    () => ({
      anim: anim.current,
      introComplete,
      isMobile,
      catalogCam,
      catalogDezoomActive,
      catalogDezoomDone,
      triggerCatalogDezoom,
    }),
    [
      catalogDezoomActive,
      catalogDezoomDone,
      introComplete,
      isMobile,
      triggerCatalogDezoom,
    ],
  );

  return (
    <PremiumAnimContext.Provider value={ctx}>
      <IphoneMesh onLoaded={handleLoaded} />
      <TechParticles />
      {children}
    </PremiumAnimContext.Provider>
  );
}

