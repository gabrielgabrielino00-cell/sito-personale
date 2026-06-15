"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  FontLoader,
  type Font,
} from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const ORANGE = 0xff6a00;
const ORANGE_GLOW = 0xff8833;
const FONT_URL = "/fonts/helvetiker_bold.typeface.json";

function canvasDimensions() {
  const vw = window.innerWidth;
  if (vw < 640) {
    return { width: Math.round(Math.min(200, vw * 0.42)), height: 130 };
  }
  if (vw < 1024) {
    return { width: 300, height: 190 };
  }
  if (vw < 1440) {
    return { width: 400, height: 250 };
  }
  return { width: 460, height: 280 };
}

function textScale() {
  const vw = window.innerWidth;
  if (vw < 640) return 2.4;
  if (vw < 1024) return 3.2;
  if (vw < 1440) return 4.2;
  return 5;
}

type HeroThreeTextOverlayProps = {
  visible: boolean;
};

export default function HeroThreeTextOverlay({
  visible,
}: HeroThreeTextOverlayProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !hostRef.current) return;

    const host = hostRef.current;
    const disposables: Array<() => void> = [];
    let animId = 0;
    let destroyed = false;

    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    disposables.push(() => renderer.dispose());

    const scene = new THREE.Scene();
    const textGroup = new THREE.Group();
    scene.add(textGroup);

    const ambient = new THREE.AmbientLight(ORANGE, 0.32);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(ORANGE, 2.4, 220);
    keyLight.position.set(18, 22, 48);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(ORANGE_GLOW, 1.6, 180);
    fillLight.position.set(-24, -8, 36);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.45, 160);
    rimLight.position.set(0, 0, -30);
    scene.add(rimLight);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 0, 72);

    const material = new THREE.MeshStandardMaterial({
      color: ORANGE,
      emissive: ORANGE,
      emissiveIntensity: 0.62,
      metalness: 0.88,
      roughness: 0.22,
    });
    disposables.push(() => material.dispose());

    function buildLine(
      font: Font,
      label: string,
      y: number,
      size: number,
    ) {
      const geometry = new TextGeometry(label, {
        font,
        size,
        depth: size * 0.22,
        curveSegments: 14,
        bevelEnabled: true,
        bevelThickness: size * 0.035,
        bevelSize: size * 0.02,
        bevelSegments: 4,
      });
      geometry.computeBoundingBox();
      geometry.center();
      disposables.push(() => geometry.dispose());

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = y;
      textGroup.add(mesh);
    }

    function resize() {
      const { width, height } = canvasDimensions();
      host.style.width = `${width}px`;
      host.style.height = `${height}px`;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    resize();
    window.addEventListener("resize", resize);
    disposables.push(() => window.removeEventListener("resize", resize));

    const loader = new FontLoader();
    loader.load(
      FONT_URL,
      (font) => {
        if (destroyed) return;
        const size = textScale();
        buildLine(font, "TECH", size * 0.72, size);
        buildLine(font, "OGGI", -size * 0.72, size * 1.08);
      },
      undefined,
      () => {
        /* font load failure — canvas stays transparent */
      },
    );

    const animate = () => {
      if (destroyed) return;
      animId = requestAnimationFrame(animate);
      textGroup.rotation.y += 0.0075;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      disposables.reverse().forEach((dispose) => dispose());
      textGroup.clear();
      canvas.remove();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute"
      style={{
        right: "5%",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
      }}
      aria-hidden
    />
  );
}