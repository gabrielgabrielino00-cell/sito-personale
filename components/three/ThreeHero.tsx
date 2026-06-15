"use client";

import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  CAMERA_DESKTOP,
  CAMERA_MOBILE,
  PHONE,
  cameraPositionFromOrbit,
  introCameraProps,
} from "@/lib/cinematic/config";
import { PremiumHeroRig, usePremiumAnim } from "./IphoneModel";

const textEase = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export type ThreeHeroHandle = {
  triggerCatalogDezoom: () => Promise<void>;
  triggerCatalogZoomIn: () => Promise<void>;
  introComplete: boolean;
  getOverlayEl: () => HTMLElement | null;
};

type ThreeHeroProps = {
  fillViewport?: boolean;
  showHeroText?: boolean;
};

// ─── Demand driver: keeps frameloop="demand" at 60fps ───

function DemandDriver() {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => invalidate());
  return null;
}

// ─── Camera: GSAP-driven during intro → OrbitControls after → catalog dezoom on CTA ───

function HeroCamera() {
  const {
    anim,
    introComplete,
    isMobile,
    catalogCam,
    catalogDezoomActive,
    catalogDezoomDone,
  } = usePremiumAnim();
  const { camera } = useThree();
  const cam = isMobile ? CAMERA_MOBILE : CAMERA_DESKTOP;
  const synced = useRef(false);

  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = cam.fov;
    camera.position.copy(
      cameraPositionFromOrbit(
        cam.startAzimuth,
        cam.startRadius,
        cam.startHeight,
      ),
    );
    camera.lookAt(PHONE.lookAt);
    camera.updateProjectionMatrix();
    synced.current = false;
    if (!introComplete) invalidate();
  }, [camera, cam, introComplete, invalidate]);

  useFrame(() => {
    if (!introComplete) {
      const pos = cameraPositionFromOrbit(
        anim.cameraAzimuth.value,
        anim.cameraRadius.value,
        anim.cameraHeight.value,
      );
      camera.position.copy(pos);
      camera.rotation.x = 0;
      camera.lookAt(PHONE.lookAt);
      return;
    }

    if (catalogDezoomActive || catalogDezoomDone) {
      const state = catalogCam.current!;
      const pos = cameraPositionFromOrbit(
        cam.endAzimuth,
        state.radius,
        state.height,
      );
      camera.position.copy(pos);
      camera.rotation.x = state.tiltX;
      camera.lookAt(PHONE.lookAt);
      return;
    }

    if (!synced.current) {
      const end = cameraPositionFromOrbit(
        cam.endAzimuth,
        cam.endRadius,
        cam.endHeight,
      );
      camera.position.copy(end);
      camera.rotation.x = 0;
      camera.lookAt(PHONE.lookAt);
      synced.current = true;
    }
  });

  const orbitEnabled =
    introComplete && !catalogDezoomActive && !catalogDezoomDone;

  return (
    <OrbitControls
      target={[PHONE.lookAt.x, PHONE.lookAt.y, PHONE.lookAt.z]}
      enabled={orbitEnabled}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 3.6}
      maxPolarAngle={Math.PI / 2.08}
      minAzimuthAngle={-Math.PI / 4.5}
      maxAzimuthAngle={Math.PI / 4.5}
      dampingFactor={0.07}
      rotateSpeed={0.32}
    />
  );
}

// ─── Cinematic lighting — subtle rim, no flashy pulses ───

function PremiumLights({ shadows }: { shadows: boolean }) {
  const rimRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (rimRef.current) {
      rimRef.current.intensity = 1.28 + Math.sin(t * 0.7) * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={0.14} color="#9ab0cc" />
      <hemisphereLight args={["#182438", "#050505", 0.28]} />
      <spotLight
        position={[5, 7, 6]}
        angle={0.38}
        penumbra={0.72}
        intensity={1.85}
        color="#eef2f8"
        castShadow={shadows}
        shadow-mapSize={shadows ? [512, 512] : undefined}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.34} color="#3d5578" />
      <pointLight
        ref={rimRef}
        position={[-3.8, 2, -3]}
        intensity={1.28}
        color="#3ec8e8"
        distance={16}
      />
      <pointLight position={[3.5, 1.2, 3.5]} intensity={0.48} color="#c8d8f0" distance={12} />
    </>
  );
}

// ─── Post-processing: selective bloom only (no DOF — keeps phone sharp at every angle) ───

function PremiumPostFX({ enabled }: { enabled: boolean }) {
  const { anim } = usePremiumAnim();
  const [progress, setProgress] = useState(0);
  const last = useRef(0);

  useFrame(() => {
    if (!enabled) return;
    const p = anim.timelineProgress.value;
    if (Math.abs(p - last.current) > 0.012) {
      last.current = p;
      setProgress(p);
    }
  });

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.13 + progress * 0.09}
        luminanceThreshold={0.86}
        luminanceSmoothing={0.92}
        mipmapBlur
        radius={0.55}
      />
      <Vignette offset={0.18} darkness={0.42} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}

// ─── Full 3D scene ───

function HeroScene({
  isMobile,
  onModelLoaded,
  onIntroComplete,
  onSceneReady,
  onDezoomReady,
}: {
  isMobile: boolean;
  onModelLoaded: () => void;
  onIntroComplete: () => void;
  onSceneReady: () => void;
  onDezoomReady: (api: {
    triggerCatalogDezoom: () => Promise<void>;
    triggerCatalogZoomIn: () => Promise<void>;
  }) => void;
}) {
  const invalidate = useThree((s) => s.invalidate);

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#08080c", 28, 58]} />

      <PremiumHeroRig
        isMobile={isMobile}
        onModelLoaded={onModelLoaded}
        onIntroComplete={onIntroComplete}
        onSceneReady={onSceneReady}
        invalidate={invalidate}
        onDezoomReady={onDezoomReady}
      >
        <HeroCamera />
        <PremiumLights shadows={!isMobile} />
        {isMobile ? null : (
          <ContactShadows position={[0, 0.82, 0]} opacity={0.22} scale={10} blur={1.8} far={4} />
        )}
        <Environment
          preset="studio"
          background={false}
          environmentIntensity={isMobile ? 0.42 : 0.62}
        />
        <PremiumPostFX enabled={!isMobile} />
        <DemandDriver />
      </PremiumHeroRig>
    </>
  );
}

// ─── Typography overlay (Framer Motion) ───

function HeroOverlay({
  visible,
  overlayRef,
}: {
  visible: boolean;
  overlayRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          ref={overlayRef}
          className="pointer-events-none absolute inset-x-0 bottom-[11%] z-20 flex flex-col items-center px-6 text-center md:bottom-[13%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: textEase }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.12, ease: textEase }}
            className="max-w-3xl text-4xl font-semibold tracking-[-0.02em] text-white md:text-6xl lg:text-7xl"
          >
            iPhone 16 Pro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.32, ease: textEase }}
            className="mt-4 max-w-lg text-sm font-light tracking-wide text-gray-500 md:text-base"
          >
            Titanium design. Pro performance. Crafted to be extraordinary.
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MobileFallback({ onEnable }: { onEnable: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-[#050505] px-6 text-center">
      <div
        className="h-44 w-44 rounded-[2rem] border border-white/[0.08] bg-gradient-to-b from-[#121218] to-[#0a0a0f] shadow-[0_0_60px_rgba(62,200,232,0.08)]"
        aria-hidden
      />
      <p className="text-xl font-medium tracking-tight text-white">iPhone 16 Pro</p>
      <p className="text-sm text-gray-600">Premium 3D experience</p>
      <button
        type="button"
        onClick={onEnable}
        className="rounded-full border border-white/10 bg-white/[0.04] px-8 py-3 text-sm text-white transition hover:border-white/20"
      >
        Attiva 3D
      </button>
    </div>
  );
}

// ─── Root hero section ───

const ThreeHero = forwardRef<ThreeHeroHandle, ThreeHeroProps>(function ThreeHero(
  { fillViewport = false, showHeroText = true },
  ref,
) {
  const isMobile = useIsMobile();
  const [webglEnabled, setWebglEnabled] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const introCamera = introCameraProps(isMobile);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dezoomRef = useRef<(() => Promise<void>) | null>(null);
  const zoomInRef = useRef<(() => Promise<void>) | null>(null);
  const sceneEventsSentRef = useRef(false);

  const handleModelLoaded = useCallback(() => {
    document.dispatchEvent(new Event("loading:model"));
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    document.dispatchEvent(new Event("heroIntroComplete"));
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
    if (sceneEventsSentRef.current) return;
    sceneEventsSentRef.current = true;
    document.documentElement.dataset.heroSceneReady = "true";
    document.dispatchEvent(new Event("loading:scene"));
    document.dispatchEvent(new Event("heroSceneReady"));
  }, []);

  useEffect(() => {
    if (isMobile) setWebglEnabled(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || webglEnabled) return;

    const timer = window.setTimeout(() => {
      handleSceneReady();
      handleIntroComplete();
    }, 600);

    return () => window.clearTimeout(timer);
  }, [isMobile, webglEnabled, handleSceneReady, handleIntroComplete]);

  const handleDezoomReady = useCallback(
    (api: {
      triggerCatalogDezoom: () => Promise<void>;
      triggerCatalogZoomIn: () => Promise<void>;
    }) => {
      dezoomRef.current = api.triggerCatalogDezoom;
      zoomInRef.current = api.triggerCatalogZoomIn;
    },
    [],
  );

  useImperativeHandle(ref, () => ({
    triggerCatalogDezoom: () => dezoomRef.current?.() ?? Promise.resolve(),
    triggerCatalogZoomIn: () => zoomInRef.current?.() ?? Promise.resolve(),
    introComplete,
    getOverlayEl: () => overlayRef.current,
  }));

  return (
    <section
      id="hero"
      className={`relative w-full overflow-hidden bg-[#050505] ${
        fillViewport ? "h-full min-h-0" : "h-[100svh] min-h-[600px]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 42%, rgba(30,60,90,0.12), transparent 70%)",
        }}
      />

      {isMobile && !webglEnabled ? (
        <MobileFallback onEnable={() => setWebglEnabled(true)} />
      ) : (
        <Canvas
          dpr={isMobile ? [1, 1.35] : [1.5, 2.5]}
          frameloop="demand"
          gl={{
            antialias: !isMobile,
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
          }}
          shadows={!isMobile}
          camera={introCamera}
          className="h-full w-full"
        >
          <Suspense fallback={null}>
            <HeroScene
              isMobile={isMobile}
              onModelLoaded={handleModelLoaded}
              onIntroComplete={handleIntroComplete}
              onSceneReady={handleSceneReady}
              onDezoomReady={handleDezoomReady}
            />
          </Suspense>
        </Canvas>
      )}

      <HeroOverlay
        visible={introComplete && showHeroText}
        overlayRef={overlayRef}
      />
    </section>
  );
});

export default ThreeHero;