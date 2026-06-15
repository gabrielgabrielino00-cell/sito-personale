"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import type { CategoryIcon } from "@/lib/data";
import { categoryModels } from "@/lib/models3d";
import { ContactShadows, Environment } from "@react-three/drei";
import { useCanvasParallax } from "@/hooks/useCanvasParallax";
import { ParallaxProvider } from "./ParallaxContext";
import CategoryViewport from "./CategoryViewport";


interface Canvas3DProps {
  variant?: "hero" | "category";
  categoryIcon?: CategoryIcon;
  className?: string;
  isActive?: boolean;
  pointerRef?: React.RefObject<HTMLElement | null>;
}

function CategoryScene({ icon }: { icon: CategoryIcon }) {
  const config = categoryModels[icon];

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.25} castShadow />
      <directionalLight position={[-3, 2, 2]} intensity={0.45} />
      <pointLight position={[0, 1, 3]} intensity={0.3} color="#f97316" />
      <CategoryViewport icon={icon} config={config} />
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.32}
        scale={10}
        blur={2.4}
        far={4.5}
      />
      <Environment preset="studio" />
    </>
  );
}

export default function Canvas3D({
  variant = "hero",
  categoryIcon,
  className,
  isActive = true,
  pointerRef,
}: Canvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerFollow =
    variant === "category" && categoryIcon
      ? Boolean(categoryModels[categoryIcon].followPointer)
      : false;

  const parallaxRef = useCanvasParallax(
    containerRef,
    variant === "hero" ? "hero" : "category",
    pointerRef,
    { pointerFollow },
  );

  return (
    <div
      ref={containerRef}
      className={`canvas-parallax-host ${className ?? ""}`}
      style={{ width: "100%", height: "100%", minHeight: "100%" }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        shadows
        frameloop={variant === "category" && !isActive ? "demand" : "always"}
      >
        <ParallaxProvider
          stateRef={parallaxRef}
          mode={variant === "hero" ? "hero" : "category"}
          isActive={isActive}
        >
          <Suspense fallback={null}>
            {variant === "hero" ? (
              <Scene />
            ) : categoryIcon ? (
              <CategoryScene icon={categoryIcon} />
            ) : null}
          </Suspense>
        </ParallaxProvider>
      </Canvas>
    </div>
  );
}