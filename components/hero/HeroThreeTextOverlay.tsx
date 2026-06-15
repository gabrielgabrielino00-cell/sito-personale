"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  FontLoader,
  type Font,
} from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const ORANGE = 0xff6a00;
const ELECTRIC_BLUE = 0x00c3ff;
const WARM_WHITE = 0xfff8f0;
const FONT_URL = "/fonts/helvetiker_bold.typeface.json";
const SWING_RAD = THREE.MathUtils.degToRad(20);

function canvasDimensions() {
  const vw = window.innerWidth;
  if (vw < 640) {
    return { width: Math.round(Math.min(300, vw * 0.82)), height: 200 };
  }
  if (vw < 1024) {
    return { width: 400, height: 248 };
  }
  if (vw < 1440) {
    return { width: 520, height: 300 };
  }
  return { width: 580, height: 328 };
}

function textSize() {
  const vw = window.innerWidth;
  if (vw < 640) return 1.65;
  if (vw < 1024) return 2.15;
  if (vw < 1440) return 2.75;
  return 3.1;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

type LetterMesh = {
  mesh: THREE.Mesh;
  baseY: number;
  delay: number;
};

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

    const chromaGlow = document.createElement("div");
    chromaGlow.style.cssText = [
      "position:absolute",
      "inset:0",
      "border-radius:12px",
      "pointer-events:none",
      "z-index:0",
      "box-shadow:0 0 2px rgba(255,106,0,0.85), 0 0 48px rgba(255,106,0,0.28)",
      "filter:drop-shadow(1px 0 0 rgba(255,106,0,0.12)) drop-shadow(-1px 0 0 rgba(0,195,255,0.08))",
    ].join(";");
    host.appendChild(chromaGlow);

    const floorGlow = document.createElement("div");
    floorGlow.style.cssText = [
      "position:absolute",
      "left:5%",
      "right:5%",
      "bottom:6%",
      "height:38%",
      "border-radius:50%",
      "background:radial-gradient(ellipse at center, rgba(255,106,0,0.32) 0%, transparent 70%)",
      "filter:blur(32px)",
      "pointer-events:none",
      "z-index:0",
      "opacity:0.75",
    ].join(";");
    host.appendChild(floorGlow);

    const shockwaveEl = document.createElement("div");
    shockwaveEl.style.cssText = [
      "position:absolute",
      "left:50%",
      "top:62%",
      "width:40px",
      "height:40px",
      "margin:-20px 0 0 -20px",
      "border-radius:50%",
      "border:2px solid rgba(255,106,0,0.9)",
      "box-shadow:0 0 24px rgba(255,106,0,0.65)",
      "pointer-events:none",
      "z-index:2",
      "opacity:0",
      "transform:scale(0.4)",
    ].join(";");
    host.appendChild(shockwaveEl);

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "display:block;width:100%;height:100%;position:relative;z-index:1;background:transparent;";
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    disposables.push(() => renderer.dispose());

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envMap = pmrem.fromScene(envScene).texture;

    const scene = new THREE.Scene();
    const rig = new THREE.Group();
    scene.add(rig);
    scene.environment = envMap;

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf4f6fa,
      metalness: 1.0,
      roughness: 0.05,
      envMap,
      envMapIntensity: 1.45,
    });

    const orangeMat = new THREE.MeshStandardMaterial({
      color: ORANGE,
      emissive: ORANGE,
      emissiveIntensity: 0.72,
      metalness: 1.0,
      roughness: 0.05,
      envMap,
      envMapIntensity: 1.65,
    });

    disposables.push(() => chromeMat.dispose());
    disposables.push(() => orangeMat.dispose());
    disposables.push(() => {
      envMap.dispose();
      pmrem.dispose();
    });

    const ambient = new THREE.AmbientLight(0x080808, 0.4);
    scene.add(ambient);

    const orangeLight = new THREE.PointLight(ORANGE, 4.2, 280);
    const blueLight = new THREE.PointLight(ELECTRIC_BLUE, 2.6, 240);
    const fillLight = new THREE.PointLight(WARM_WHITE, 2.8, 260);
    const rimLight = new THREE.PointLight(0xffffff, 1.2, 200);
    scene.add(orangeLight, blueLight, fillLight, rimLight);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 220);
    camera.position.set(0, 1.2, 88);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(52, 52),
      new THREE.MeshStandardMaterial({
        color: 0x050505,
        metalness: 1.0,
        roughness: 0.06,
        transparent: true,
        opacity: 0.28,
        envMap,
        envMapIntensity: 0.9,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.2;
    rig.add(floor);
    disposables.push(() => {
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
    });

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      0.42,
      0.55,
      0.18,
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    disposables.push(() => composer.dispose());

    const letterMeshes: LetterMesh[] = [];
    let numMesh: THREE.Mesh | null = null;
    let numBaseY = 0;
    let numBaseScale = 1;
    let shockwaveMesh: THREE.Mesh | null = null;
    let sparks: THREE.Points | null = null;
    let sparkAngles: Float32Array | null = null;
    let introAt = -1;
    let shockwaveFired = false;

    function extrude(
      font: Font,
      label: string,
      size: number,
      mat: THREE.MeshStandardMaterial,
    ) {
      const geometry = new TextGeometry(label, {
        font,
        size,
        depth: size * 0.28,
        curveSegments: 18,
        bevelEnabled: true,
        bevelThickness: size * 0.045,
        bevelSize: size * 0.024,
        bevelSegments: 6,
      });
      geometry.computeBoundingBox();
      disposables.push(() => geometry.dispose());
      return new THREE.Mesh(geometry, mat);
    }

    function buildLogo(font: Font) {
      const size = textSize();
      const size51 = size * 1.85;
      const word = "Elettronica";
      let cursorX = 0;
      const letterGap = size * 0.02;
      const lineY = size * 0.95;

      word.split("").forEach((char, index) => {
        const mesh = extrude(font, char, size, chromeMat);
        const box = mesh.geometry.boundingBox!;
        const charW = box.max.x - box.min.x;
        mesh.position.x = cursorX - box.min.x;
        mesh.position.y = lineY;
        mesh.position.z = 0;
        const baseY = lineY;
        mesh.position.y = baseY + 5.5;
        mesh.scale.y = 1.35;
        rig.add(mesh);
        letterMeshes.push({ mesh, baseY, delay: index * 0.11 });
        cursorX += charW + letterGap;
      });

      const wordWidth = cursorX - letterGap;
      letterMeshes.forEach(({ mesh }) => {
        mesh.position.x -= wordWidth / 2;
      });

      numMesh = extrude(font, "51", size51, orangeMat);
      const numBox = numMesh.geometry.boundingBox!;
      const numW = numBox.max.x - numBox.min.x;
      numBaseY = -size * 0.95;
      numMesh.position.x = -numW / 2 - numBox.min.x;
      numMesh.position.y = numBaseY + 8;
      numMesh.position.z = 0.2;
      numMesh.scale.setScalar(0.01);
      numBaseScale = 1;
      rig.add(numMesh);

      const shockGeom = new THREE.RingGeometry(0.4, 0.55, 64);
      const shockMat = new THREE.MeshBasicMaterial({
        color: ORANGE,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      shockwaveMesh = new THREE.Mesh(shockGeom, shockMat);
      shockwaveMesh.position.set(0, numBaseY, 0.4);
      shockwaveMesh.rotation.x = -Math.PI / 2;
      rig.add(shockwaveMesh);
      disposables.push(() => {
        shockGeom.dispose();
        shockMat.dispose();
      });

      const sparkCount = 48;
      const positions = new Float32Array(sparkCount * 3);
      sparkAngles = new Float32Array(sparkCount);
      for (let i = 0; i < sparkCount; i += 1) {
        sparkAngles[i] = (i / sparkCount) * Math.PI * 2;
        positions[i * 3] = 0;
        positions[i * 3 + 1] = numBaseY;
        positions[i * 3 + 2] = 0;
      }
      const sparkGeom = new THREE.BufferGeometry();
      sparkGeom.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      const sparkMat = new THREE.PointsMaterial({
        color: ORANGE,
        size: 0.14,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      sparks = new THREE.Points(sparkGeom, sparkMat);
      rig.add(sparks);
      disposables.push(() => {
        sparkGeom.dispose();
        sparkMat.dispose();
      });

      introAt = clock.getElapsedTime();
    }

    function resize() {
      const { width, height } = canvasDimensions();
      host.style.width = `${width}px`;
      host.style.height = `${height}px`;
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    resize();
    window.addEventListener("resize", resize);
    disposables.push(() => window.removeEventListener("resize", resize));

    const clock = new THREE.Clock();

    const loader = new FontLoader();
    loader.load(FONT_URL, (font) => {
      if (destroyed) return;
      buildLogo(font);
    });

    const animate = () => {
      if (destroyed) return;
      animId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();
      const sinceIntro = introAt >= 0 ? t - introAt : 0;

      letterMeshes.forEach(({ mesh, baseY, delay }) => {
        const local = Math.max(0, sinceIntro - delay);
        const progress = Math.min(1, local / 0.48);
        const eased = easeOutCubic(progress);
        mesh.position.y = baseY + (1 - eased) * 5.5;
        mesh.scale.y = 1.35 - eased * 0.35;
        mesh.visible = progress > 0.02;
      });

      const slamDelay = letterMeshes.length * 0.11 + 0.25;
      if (numMesh) {
        const slamLocal = Math.max(0, sinceIntro - slamDelay);
        const slamP = Math.min(1, slamLocal / 0.38);
        if (slamP > 0) {
          const eased = easeOutBack(slamP);
          numMesh.position.y = numBaseY + (1 - eased) * 8;
          const s = Math.max(0.01, eased * numBaseScale);
          numMesh.scale.setScalar(s);
        }

        if (slamP >= 1 && !shockwaveFired) {
          shockwaveFired = true;
          shockwaveEl.style.transition =
            "transform 0.85s cubic-bezier(0.16,1,0.3,1), opacity 0.85s ease-out";
          shockwaveEl.style.opacity = "1";
          shockwaveEl.style.transform = "scale(5)";
          window.setTimeout(() => {
            shockwaveEl.style.opacity = "0";
          }, 120);
        }
      }

      if (shockwaveMesh && sinceIntro > slamDelay) {
        const waveT = Math.min(1, (sinceIntro - slamDelay - 0.05) / 0.7);
        if (waveT > 0 && waveT < 1) {
          const scale = 1 + waveT * 7;
          shockwaveMesh.scale.set(scale, scale, scale);
          (shockwaveMesh.material as THREE.MeshBasicMaterial).opacity =
            (1 - waveT) * 0.75;
        }
      }

      const orbitR = 28;
      orangeLight.position.set(
        Math.cos(t * 0.34) * orbitR,
        10 + Math.sin(t * 0.52) * 6,
        Math.sin(t * 0.34) * orbitR + 42,
      );
      blueLight.position.set(
        Math.cos(t * 0.28 + 2.1) * (orbitR * 0.85),
        6 + Math.sin(t * 0.41 + 1) * 8,
        Math.sin(t * 0.28 + 2.1) * (orbitR * 0.85) + 36,
      );
      fillLight.position.set(
        Math.sin(t * 0.22) * 14,
        22,
        48 + Math.cos(t * 0.22) * 10,
      );
      rimLight.position.set(0, -8, 30);

      if (sinceIntro > slamDelay + 0.35) {
        rig.rotation.y = Math.sin(t * 0.38) * SWING_RAD;
        rig.position.y = Math.sin(t * 0.72) * 0.38;
      }

      if (sparks && sparkAngles && numMesh) {
        const pos = sparks.geometry.attributes.position as THREE.BufferAttribute;
        const orbit = 2.8 + Math.sin(t * 0.6) * 0.35;
        for (let i = 0; i < sparkAngles.length; i += 1) {
          const a = sparkAngles[i] + t * 0.45;
          const yOff = Math.sin(a * 2.2) * 0.55;
          pos.setXYZ(
            i,
            numMesh.position.x + Math.cos(a) * orbit,
            numBaseY + yOff + Math.sin(t + i) * 0.12,
            Math.sin(a) * orbit * 0.55,
          );
        }
        pos.needsUpdate = true;
      }

      floorGlow.style.opacity = String(0.62 + Math.sin(t * 0.72) * 0.14);

      composer.render();
    };
    animate();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      disposables.reverse().forEach((dispose) => dispose());
      rig.clear();
      chromaGlow.remove();
      floorGlow.remove();
      shockwaveEl.remove();
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