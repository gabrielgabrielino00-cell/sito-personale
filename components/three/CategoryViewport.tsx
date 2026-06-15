"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bounds, Center, useBounds } from "@react-three/drei";
import type { CategoryIcon } from "@/lib/data";
import type { Model3DConfig } from "@/lib/models3d";
import { ModelSlot } from "./ModelSlot";
import { useParallaxContext } from "./ParallaxContext";

function CategoryFitSync({ hasAnimation }: { hasAnimation: boolean }) {
  const api = useBounds();
  const { isActive } = useParallaxContext();
  const fitUntil = useRef(0);
  const lastFit = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    api.refresh().fit();
    fitUntil.current = performance.now() + 1100;

    const mid = window.setTimeout(() => api.refresh().fit(), 450);
    const end = window.setTimeout(() => api.refresh().fit(), 950);

    return () => {
      window.clearTimeout(mid);
      window.clearTimeout(end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bounds api is stable per instance
  }, [isActive]);

  useFrame(() => {
    if (!isActive || !hasAnimation) return;
    const now = performance.now();
    if (now > fitUntil.current) return;
    if (now - lastFit.current < 90) return;
    lastFit.current = now;
    api.refresh().fit();
  });

  return null;
}

type CategoryViewportProps = {
  icon: CategoryIcon;
  config: Model3DConfig;
};

export default function CategoryViewport({
  icon,
  config,
}: CategoryViewportProps) {
  const rotation = config.rotation ?? [0, 0, 0];
  const margin = config.boundsMargin ?? 1.18;

  return (
    <Bounds fit clip observe margin={margin} maxDuration={0}>
      <CategoryFitSync hasAnimation={Boolean(config.animation)} />
      <Center precise>
        <group rotation={rotation}>
          <ModelSlot config={config} fallback={icon} />
        </group>
      </Center>
    </Bounds>
  );
}