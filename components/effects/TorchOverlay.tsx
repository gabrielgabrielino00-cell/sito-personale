"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTorch } from "@/hooks/useTorch";

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uIntensity;

varying vec2 vUv;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = rot * p * 2.02 + vec2(1.7, 9.2);
    a *= 0.48;
  }
  return v;
}

float smokeField(vec2 uv, vec2 flow, float t) {
  vec2 q = vec2(0.0);
  q.x = fbm(uv + flow + vec2(0.0, t * 0.04));
  q.y = fbm(uv + flow + vec2(5.2, 1.3) + t * 0.05);

  vec2 r = vec2(0.0);
  r.x = fbm(uv + 1.4 * q + vec2(1.7, 9.2) + t * 0.035);
  r.y = fbm(uv + 1.4 * q + vec2(8.3, 2.8) + t * 0.042);

  return fbm(uv + 1.6 * r + flow);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = (uv - 0.5) * aspect;

  vec2 mouse = (uMouse - 0.5) * aspect;
  float dist = length(p - mouse);

  float t = uTime;
  vec2 rise = vec2(sin(t * 0.11) * 0.08, t * 0.06);
  vec2 warp = (mouse - p) * smoothstep(0.55, 0.0, dist) * 0.35;
  vec2 sampleUv = p * 1.35 + rise + warp;

  float base = smokeField(sampleUv, vec2(0.0), t);
  float detail = smokeField(sampleUv * 2.1 + vec2(3.1, 1.8), vec2(1.2, 0.4), t * 1.15);
  float smoke = mix(base, detail, 0.38);
  smoke = smoothstep(0.08, 0.92, smoke);

  float emitter = smoothstep(0.42, 0.0, dist);
  float trail = smoothstep(0.72, 0.0, dist) * 0.55;
  float density = smoke * (0.22 + emitter * 0.78 + trail * 0.35);
  density *= uIntensity;

  vec3 hot = vec3(1.0, 0.55, 0.12);
  vec3 core = vec3(1.0, 0.42, 0.0);
  vec3 cool = vec3(0.55, 0.48, 0.42);

  float heat = clamp(emitter * 1.2 + smoke * 0.25, 0.0, 1.0);
  vec3 col = mix(cool, core, smoke * 0.85);
  col = mix(col, hot, heat * 0.65);
  col *= density * 1.35;

  float alpha = clamp(density * 0.85, 0.0, 0.75);

  gl_FragColor = vec4(col, alpha);
}
`;

export default function TorchOverlay() {
  const { enabled } = useTorch();
  const hostRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(enabled);
  const readyRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const hostNode = hostRef.current;
    if (!hostNode) return;
    const host: HTMLDivElement = hostNode;

    let frameId = 0;
    let destroyed = false;
    let targetMouse = new THREE.Vector2(0.5, 0.5);
    let smoothMouse = new THREE.Vector2(0.5, 0.5);

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;";
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      host.style.width = `${w}px`;
      host.style.height = `${h}px`;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    }

    function onMove(clientX: number, clientY: number) {
      targetMouse.set(clientX / window.innerWidth, 1 - clientY / window.innerHeight);
    }

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const clock = new THREE.Clock();

    function render() {
      if (destroyed) return;
      frameId = requestAnimationFrame(render);

      if (!readyRef.current || !enabledRef.current) {
        renderer.clear();
        return;
      }

      smoothMouse.lerp(targetMouse, 0.09);
      uniforms.uMouse.value.copy(smoothMouse);
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uIntensity.value = 1;

      renderer.render(scene, camera);
    }

    function activate() {
      readyRef.current = true;
      targetMouse.set(0.5, 0.4);
      smoothMouse.copy(targetMouse);
    }

    resize();
    const onLoadingDone = () => activate();
    if (!document.body.classList.contains("ls-loading-active")) {
      activate();
    } else {
      document.addEventListener("loadingComplete", onLoadingDone, { once: true });
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    render();

    return () => {
      destroyed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("loadingComplete", onLoadingDone);
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      id="smoke-shader-host"
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-[45] transition-opacity duration-500 ${
        enabled ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}