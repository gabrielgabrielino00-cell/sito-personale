"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useParallaxContext } from "./ParallaxContext";

type ParallaxRigProps = {
  basePosition?: [number, number, number];
  lookAt?: [number, number, number];
  fov?: number;
};

export default function ParallaxRig({
  basePosition = [0, 0.1, 5.8],
  lookAt = [0, 0, 0],
  fov = 38,
}: ParallaxRigProps) {
  const { mode } = useParallaxContext();
  const lookTarget = useRef(new THREE.Vector3(...lookAt));
  const initialized = useRef(false);

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    camera.fov = fov;
    camera.updateProjectionMatrix();

    if (mode === "category" || !initialized.current) {
      camera.position.set(...basePosition);
      camera.lookAt(lookTarget.current);
      initialized.current = true;
    }
  });

  return null;
}