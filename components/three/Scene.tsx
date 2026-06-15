"use client";

import { Suspense } from "react";
import { ContactShadows, Environment } from "@react-three/drei";
import { HERO_CAMERA, heroModel } from "@/lib/models3d";
import { ModelSlot } from "./ModelSlot";
import ParallaxRig from "./ParallaxRig";

export default function Scene() {
  return (
    <>
      <ParallaxRig
        basePosition={HERO_CAMERA.position}
        lookAt={HERO_CAMERA.lookAt}
        fov={HERO_CAMERA.fov}
      />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.7} color="#ffffff" />
      <pointLight position={[-4, 2, 3]} intensity={0.85} color="#f97316" />
      <pointLight position={[4, -1, 2]} intensity={0.45} color="#fdba74" />
      <spotLight
        position={[0, 6, 4]}
        angle={0.45}
        penumbra={0.5}
        intensity={1.3}
        color="#ffffff"
        castShadow
      />

      <Suspense fallback={null}>
        <ModelSlot config={heroModel} fallback="hero" />
        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.28}
          scale={9}
          blur={2.5}
          far={4}
        />
        <Environment preset="studio" />
      </Suspense>
    </>
  );
}