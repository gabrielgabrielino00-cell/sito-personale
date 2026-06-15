"use client";

import type { CategoryIcon } from "@/lib/data";
import type { Model3DConfig } from "@/lib/models3d";
import { CategoryModel, IPhone17Model } from "./models";
import ModelGLB from "./ModelGLB";
interface ModelSlotProps {
  config: Model3DConfig;
  fallback: "hero" | CategoryIcon;
}

export function ModelSlot({ config, fallback }: ModelSlotProps) {
  if (config.path) {
    return <ModelGLB path={config.path} config={config} />;
  }

  if (fallback === "hero") {
    return <IPhone17Model scale={config.scale ?? 1.05} />;
  }

  return <CategoryModel icon={fallback} scale={config.scale ?? 0.9} />;
}