"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  FontLoader,
  type Font,
} from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const ORANGE = 0xff6a00;
const WARM_WHITE = 0xfff5e0;
const FONT_URL = "/fonts/helvetiker_bold.typeface.json";
const SWING_RAD = THREE.MathUtils.degToRad(15);

function canvasDimensions() {
  const vw = window.innerWidth;
  if (vw < 640) {
    return { width: Math.round(Math.min(280, vw * 0.78)), height: 118 };
  }
  if (vw < 1024) {
    return { width: 380, height: 148 };
  }
  if (vw < 1440) {
    return { width: 500, height: 172 };
  }
  return { width: 560, height: 188 };
}

function textSize() {
  const vw = window.innerWidth;
  if (vw < 640) return 2.1;
  if (vw < 1024) return 2.8;
  if (vw < 1440) return 3.6;
  return 4.2;
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

    const glow = document.createElement("div");
    glow.style.cssText = [
      "position:absolute",
      "inset:18% 4% 8% 4%",
      "border-radius:50%",
      "background:radial-gradient(ellipse at center, rgba(255,106,0,0.42) 0%, rgba(255,106,0,0.14) 42%, transparent 72%)",
      "filter:blur(28px)",
      "pointer-events:none",
      "z-index:0",
    ].join(";");
    host.appendChild(glow);

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;position:relative;z-index:1;";
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    disposables.push(() => renderer.dispose());

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envMap = pmrem.fromScene(envScene).texture;

    const scene = new THREE.Scene();
    const textGroup = new THREE.Group();
    scene.add(textGroup);
    scene.environment = envMap;

    const ambient = new THREE.AmbientLight(0x0a0a0a, 0.55);
    scene.add(ambient);

    const orangeLight = new THREE.PointLight(ORANGE, 3.2, 240);
    orangeLight.position.set(22, 14, 52);
    scene.add(orangeLight);

    const warmLight = new THREE.PointLight(WARM_WHITE, 2.4, 220);
    warmLight.position.set(-18, 26, 44);
    scene.add(warmLight);

    const shadowLight = new THREE.PointLight(0x1a0800, 1.8, 180);
    shadowLight.position.set(0, -32, 18);
    scene.add(shadowLight);

    const rimLight = new THREE.DirectionalLight(WARM_WHITE, 0.65);
    rimLight.position.set(0, 8, 60);
    scene.add(rimLight);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(0, 0, 78);

    const materialSilver = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.2,
      envMap,
      envMapIntensity: 1.1,
    });

    const materialOrange = new THREE.MeshStandardMaterial({
      color: ORANGE,
      emissive: ORANGE,
      emissiveIntensity: 0.38,
      metalness: 1.0,
      roughness: 0.15,
      envMap,
      envMapIntensity: 1.35,
    });

    disposables.push(() => materialSilver.dispose());
    disposables.push(() => materialOrange.dispose());
    disposables.push(() => {
      envMap.dispose();
      pmrem.dispose();
      envScene.dispose();
    });

    function extrudeText(font: Font, label: string, size: number) {
      const geometry = new TextGeometry(label, {
        font,
        size,
        depth: size * 0.26,
        curveSegments: 16,
        bevelEnabled: true,
        bevelThickness: size * 0.04,
        bevelSize: size * 0.022,
        bevelSegments: 5,
      });
      geometry.computeBoundingBox();
      disposables.push(() => geometry.dispose());
      return geometry;
    }

    function layoutBrand(font: Font) {
      const size = textSize();
      const size51 = size * 1.12;
      const gap = size * 0.1;

      const geoName = extrudeText(font, "Elettronica", size);
      const geoNum = extrudeText(font, "51", size51);

      const boxName = geoName.boundingBox!;
      const boxNum = geoNum.boundingBox!;
      const widthName = boxName.max.x - boxName.min.x;
      const widthNum = boxNum.max.x - boxNum.min.x;
      const totalWidth = widthName + gap + widthNum;

      const meshName = new THREE.Mesh(geoName, materialSilver);
      meshName.position.x = -totalWidth / 2 - boxName.min.x;
      meshName.position.y = -(boxName.max.y + boxName.min.y) / 2;

      const meshNum = new THREE.Mesh(geoNum, materialOrange);
      meshNum.position.x = meshName.position.x + widthName + gap - boxNum.min.x;
      meshNum.position.y = -(boxNum.max.y + boxNum.min.y) / 2 + size * 0.04;

      textGroup.add(meshName, meshNum);
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
        layoutBrand(font);
      },
      undefined,
      () => {
        /* silent fail — transparent canvas */
      },
    );

    const clock = new THREE.Clock();
    let glowPhase = 0;

    const animate = () => {
      if (destroyed) return;
      animId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();
      textGroup.rotation.y = Math.sin(t * 0.42) * SWING_RAD;
      textGroup.position.y = Math.sin(t * 0.85) * 0.32;

      glowPhase = 0.72 + Math.sin(t * 0.85) * 0.14;
      glow.style.opacity = String(glowPhase);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      disposables.reverse().forEach((dispose) => dispose());
      textGroup.clear();
      glow.remove();
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
        background: "transparent",
      }}
      aria-hidden
    />
  );
}