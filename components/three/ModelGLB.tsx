"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Model3DConfig } from "@/lib/models3d";
import { prepareCategoryClips } from "@/lib/modelAnimations";
import { applyBodyTint } from "@/lib/modelMaterials";
import { useParallaxContext } from "./ParallaxContext";

interface ModelGLBProps {
  path: string;
  config?: Model3DConfig;
}

function scaleModel(
  scene: THREE.Object3D,
  targetScale = 1,
  maxSize = 2.5,
) {
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const autoScale = maxDim > 0 ? maxSize / maxDim : 1;
  scene.scale.setScalar(autoScale * targetScale);
}

function cloneScene(scene: THREE.Object3D) {
  const copy = scene.clone(true);

  copy.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) => material.clone());
      return;
    }

    if (mesh.material) {
      mesh.material = mesh.material.clone();
    }
  });

  return copy;
}

function applyPointerFollow(
  group: THREE.Group,
  px: number,
  py: number,
  baseRotation: [number, number, number],
  basePosition: [number, number, number],
  rotFollow: number,
  posFollow: number,
  intensity: "hero" | "category",
) {
  const rotScale = intensity === "hero" ? 1.12 : 0.72;
  const posScale = intensity === "hero" ? 1 : 0.38;

  const targetRotY = baseRotation[1] + px * Math.PI * rotScale;
  const targetRotX = baseRotation[0] + py * (Math.PI / 2.8) * rotScale;
  const targetRotZ =
    baseRotation[2] + (-px * 0.28 + py * 0.12) * rotScale;

  const targetPosX = basePosition[0] + px * 0.38 * posScale;
  const targetPosY = basePosition[1] + py * 0.28 * posScale;
  const targetPosZ = basePosition[2] + py * 0.12 * posScale;

  group.rotation.x = THREE.MathUtils.lerp(
    group.rotation.x,
    targetRotX,
    rotFollow,
  );
  group.rotation.y = THREE.MathUtils.lerp(
    group.rotation.y,
    targetRotY,
    rotFollow,
  );
  group.rotation.z = THREE.MathUtils.lerp(
    group.rotation.z,
    targetRotZ,
    rotFollow,
  );
  group.position.x = THREE.MathUtils.lerp(
    group.position.x,
    targetPosX,
    posFollow,
  );
  group.position.y = THREE.MathUtils.lerp(
    group.position.y,
    targetPosY,
    posFollow,
  );
  group.position.z = THREE.MathUtils.lerp(
    group.position.z,
    targetPosZ,
    posFollow,
  );
}

export default function ModelGLB({
  path,
  config = { path },
}: ModelGLBProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(path);
  const { stateRef, mode, isActive } = useParallaxContext();
  const wasActive = useRef(false);
  const followPointer = config.followPointer ?? false;

  const baseRotation = useMemo<[number, number, number]>(
    () => config.rotation ?? [0, 0, 0],
    [config.rotation],
  );
  const basePosition = useMemo<[number, number, number]>(
    () => config.position ?? [0, 0, 0],
    [config.position],
  );

  const model = useMemo(() => {
    const copy = cloneScene(scene);
    copy.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    if (mode === "category") {
      scaleModel(copy, config.scale ?? 1, config.maxSize ?? 2.5);
    } else {
      copy.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(copy);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      copy.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      const autoScale = maxDim > 0 ? (config.maxSize ?? 2.5) / maxDim : 1;
      copy.scale.setScalar(autoScale * (config.scale ?? 1));

      if (config.bodyTint) {
        applyBodyTint(copy, config.bodyTint);
      }
    }

    return copy;
  }, [scene, config.scale, config.maxSize, config.bodyTint, mode]);

  const clips = useMemo(
    () =>
      mode === "category"
        ? prepareCategoryClips(path, animations)
        : animations,
    [animations, mode, path],
  );

  const { actions, names } = useAnimations(clips, model);

  const playOpeningAnimation = () => {
    if (!animations.length || !actions) return;

    const clipName = config.animation ?? names[0];
    const action = clipName ? actions[clipName] : undefined;
    if (!action) return;

    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.fadeIn(0.25).play();
  };

  useEffect(() => {
    if (mode !== "category") return;

    if (isActive && !wasActive.current) {
      playOpeningAnimation();
    }

    wasActive.current = isActive;
  }, [isActive, mode, actions, names, config.animation, animations.length]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (mode === "category") {
      if (!followPointer || !isActive) {
        groupRef.current.position.set(
          basePosition[0],
          basePosition[1],
          basePosition[2],
        );
        groupRef.current.rotation.set(
          baseRotation[0],
          baseRotation[1],
          baseRotation[2],
        );
        return;
      }

      applyPointerFollow(
        groupRef.current,
        stateRef.current.pointerX,
        stateRef.current.pointerY,
        baseRotation,
        basePosition,
        0.48,
        0.26,
        "category",
      );
      return;
    }

    applyPointerFollow(
      groupRef.current,
      stateRef.current.pointerX,
      stateRef.current.pointerY,
      baseRotation,
      basePosition,
      0.38,
      0.3,
      "hero",
    );
  });

  return (
    <group ref={groupRef} position={basePosition} rotation={baseRotation}>
      <primitive object={model} />
    </group>
  );
}