"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  FontLoader,
  type Font,
} from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";
const PARTICLE_COUNT = 120;

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
    let animId = 0;
    let destroyed = false;
    const disposables: Array<() => void> = [];

    const bloom = document.createElement("div");
    bloom.style.cssText = [
      "position:absolute",
      "top:50%",
      "left:50%",
      "transform:translate(-50%,-50%)",
      "width:min(420px,92%)",
      "height:min(180px,72%)",
      "background:radial-gradient(ellipse at center, rgba(255,106,0,0.35) 0%, rgba(255,106,0,0.08) 50%, transparent 75%)",
      "filter:blur(32px)",
      "pointer-events:none",
      "z-index:0",
      "animation:bloomPulse 3s ease-in-out infinite",
    ].join(";");
    host.appendChild(bloom);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes bloomPulse {
        0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
      }
    `;
    host.appendChild(style);

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    renderer.shadowMap.enabled = true;
    disposables.push(() => renderer.dispose());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.2, 9);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const orangeLight = new THREE.PointLight(0xff6a00, 6, 18);
    orangeLight.position.set(3, 3, 4);
    scene.add(orangeLight);

    const blueLight = new THREE.PointLight(0x00c3ff, 3, 18);
    blueLight.position.set(-4, 2, 3);
    scene.add(blueLight);

    const rimLight = new THREE.PointLight(0xfff5e0, 2, 12);
    rimLight.position.set(0, -3, 5);
    scene.add(rimLight);

    const floorGeo = new THREE.PlaneGeometry(14, 5);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.95,
      roughness: 0.15,
      opacity: 0.55,
      transparent: true,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.1;
    scene.add(floor);
    disposables.push(() => {
      floorGeo.dispose();
      floorMat.dispose();
    });

    const group = new THREE.Group();
    scene.add(group);

    const matChrome = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.08,
      envMapIntensity: 1.2,
    });
    const matOrange = new THREE.MeshStandardMaterial({
      color: 0xff6a00,
      metalness: 1.0,
      roughness: 0.06,
      emissive: new THREE.Color(0xff3300),
      emissiveIntensity: 0.45,
    });
    disposables.push(() => matChrome.dispose());
    disposables.push(() => matOrange.dispose());

    function makeText(
      font: Font,
      text: string,
      mat: THREE.MeshStandardMaterial,
      size: number,
      depth: number,
    ) {
      const geo = new TextGeometry(text, {
        font,
        size,
        depth,
        curveSegments: 14,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.025,
        bevelSegments: 8,
      });
      geo.computeBoundingBox();
      const cx =
        (geo.boundingBox!.max.x - geo.boundingBox!.min.x) / 2 +
        geo.boundingBox!.min.x;
      geo.translate(-cx, 0, 0);
      disposables.push(() => geo.dispose());
      return new THREE.Mesh(geo, mat);
    }

    let enterAnim: ((delta: number) => boolean) | null = null;
    let enterDone = false;

    const fontLoader = new FontLoader();
    fontLoader.load(FONT_URL, (font) => {
      if (destroyed) return;

      const topMesh = makeText(font, "Elettronica", matChrome, 0.72, 0.22);
      topMesh.position.y = 0.72;
      group.add(topMesh);

      const botMesh = makeText(font, "51", matOrange, 1.35, 0.42);
      botMesh.position.y = -0.88;
      group.add(botMesh);

      group.scale.set(0.01, 0.01, 0.01);
      let t = 0;
      const enterDur = 1.4;
      enterAnim = (delta: number) => {
        t += delta;
        const p = Math.min(t / enterDur, 1);
        const e = 1 - (1 - p) ** 4;
        group.scale.setScalar(e);
        group.rotation.y = (1 - e) * -0.6;
        return p >= 1;
      };
    });

    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pVelocities: Array<{
      speed: number;
      angle: number;
      yDrift: number;
      r: number;
    }> = [];

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const r = 2.2 + Math.random() * 1.8;
      const a = Math.random() * Math.PI * 2;
      pPositions[i * 3] = Math.cos(a) * r;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      pPositions[i * 3 + 2] = Math.sin(a) * r * 0.4;
      pVelocities.push({
        speed: 0.004 + Math.random() * 0.008,
        angle: a,
        yDrift: (Math.random() - 0.5) * 0.012,
        r,
      });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xff6a00,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    disposables.push(() => {
      pGeo.dispose();
      pMat.dispose();
    });

    const ringGeo = new THREE.RingGeometry(0.1, 0.18, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff6a00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -2.09;
    scene.add(ring);
    disposables.push(() => {
      ringGeo.dispose();
      ringMat.dispose();
    });

    let ringActive = false;
    let ringT = 0;
    const ringTimer = window.setTimeout(() => {
      if (!destroyed) {
        ringActive = true;
        ringT = 0;
      }
    }, 1500);

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

    const clock = new THREE.Clock();

    const animate = () => {
      if (destroyed) return;
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (!enterDone && enterAnim) {
        enterDone = enterAnim(delta);
      }

      if (group.children.length) {
        group.rotation.y = Math.sin(elapsed * 0.5) * 0.32;
        group.position.y = Math.sin(elapsed * 0.7) * 0.14;
      }

      const la = elapsed * 0.6;
      orangeLight.position.set(
        Math.cos(la) * 5,
        3 + Math.sin(la * 0.5),
        Math.sin(la) * 4,
      );
      blueLight.position.set(
        Math.cos(la + Math.PI) * 5,
        2,
        Math.sin(la + Math.PI) * 4,
      );

      const pos = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const v = pVelocities[i];
        v.angle += v.speed;
        pos[i * 3] = Math.cos(v.angle) * v.r;
        pos[i * 3 + 1] += v.yDrift;
        pos[i * 3 + 2] = Math.sin(v.angle) * v.r * 0.4;
        if (pos[i * 3 + 1] > 2.5) pos[i * 3 + 1] = -2.5;
        if (pos[i * 3 + 1] < -2.5) pos[i * 3 + 1] = 2.5;
      }
      pGeo.attributes.position.needsUpdate = true;

      if (ringActive) {
        ringT += delta;
        const rp = Math.min(ringT / 1.2, 1);
        const scale = 1 + rp * 28;
        ring.scale.set(scale, scale, scale);
        ringMat.opacity = (1 - rp) * 0.7;
        if (rp >= 1) ringActive = false;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      window.clearTimeout(ringTimer);
      disposables.reverse().forEach((dispose) => dispose());
      group.clear();
      scene.clear();
      bloom.remove();
      style.remove();
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