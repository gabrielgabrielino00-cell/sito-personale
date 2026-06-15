"use client";

import { useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { IPHONE_MODEL_PATH } from "@/lib/cinematic/config";

export default function HeroModelPreload() {
  useLayoutEffect(() => {
    useGLTF.preload(IPHONE_MODEL_PATH);
    document.dispatchEvent(new Event("loading:hero"));
  }, []);

  return null;
}