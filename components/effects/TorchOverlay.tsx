"use client";

import { useEffect, useRef } from "react";
import { useTorch } from "@/hooks/useTorch";

const SMOKE_MAX = 140;
const BURST_RADIUS = 200;

class SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  growth: number;
  hue: number;

  constructor(x: number, y: number, burst = false) {
    const spread = burst ? 90 : 45;
    this.x = x + (Math.random() - 0.5) * spread;
    this.y = y + (Math.random() - 0.5) * spread;
    this.vx = (Math.random() - 0.5) * (burst ? 1.8 : 0.9);
    this.vy = -0.35 - Math.random() * (burst ? 1.4 : 0.8);
    this.maxLife = burst ? 90 + Math.random() * 50 : 110 + Math.random() * 80;
    this.life = this.maxLife;
    this.size = burst ? 28 + Math.random() * 36 : 18 + Math.random() * 28;
    this.growth = 0.55 + Math.random() * 0.45;
    this.hue = Math.random();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.985;
    this.vy *= 0.992;
    this.vx += (Math.random() - 0.5) * 0.08;
    this.size += this.growth;
    this.life -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const t = this.life / this.maxLife;
    const alpha = t * t * 0.22;
    if (alpha < 0.01) return;

    const r = this.size * (1.1 + (1 - t) * 0.35);
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    const hot = this.hue > 0.55;

    if (hot) {
      grad.addColorStop(0, `rgba(255, 120, 30, ${alpha * 0.9})`);
      grad.addColorStop(0.35, `rgba(255, 90, 15, ${alpha * 0.55})`);
      grad.addColorStop(0.7, `rgba(180, 55, 10, ${alpha * 0.2})`);
    } else {
      grad.addColorStop(0, `rgba(255, 150, 60, ${alpha * 0.75})`);
      grad.addColorStop(0.4, `rgba(255, 106, 0, ${alpha * 0.45})`);
      grad.addColorStop(0.75, `rgba(140, 45, 8, ${alpha * 0.15})`);
    }
    grad.addColorStop(1, "rgba(80, 30, 5, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function TorchOverlay() {
  const { enabled } = useTorch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    w: 0,
    h: 0,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    prevX: 0,
    prevY: 0,
    particles: [] as SmokePuff[],
    ready: false,
    enabled: true,
  });

  useEffect(() => {
    stateRef.current.enabled = enabled;
  }, [enabled]);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    if (!canvasNode) return;
    const canvasEl: HTMLCanvasElement = canvasNode;

    const context = canvasEl.getContext("2d", { alpha: true });
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const state = stateRef.current;
    let frameId = 0;

    function spawnSmoke(x: number, y: number, amount = 4, burst = false) {
      for (let i = 0; i < amount; i += 1) {
        if (state.particles.length < SMOKE_MAX) {
          state.particles.push(new SmokePuff(x, y, burst));
        }
      }
    }

    function updateParticles() {
      for (let i = state.particles.length - 1; i >= 0; i -= 1) {
        state.particles[i].update();
        if (state.particles[i].life <= 0) state.particles.splice(i, 1);
      }
    }

    function drawSmokeCloud(x: number, y: number) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const core = ctx.createRadialGradient(x, y, 0, x, y, BURST_RADIUS * 0.55);
      core.addColorStop(0, "rgba(255, 130, 40, 0.14)");
      core.addColorStop(0.45, "rgba(255, 106, 0, 0.08)");
      core.addColorStop(1, "rgba(255, 80, 10, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(x, y, BURST_RADIUS * 0.55, 0, Math.PI * 2);
      ctx.fill();

      const halo = ctx.createRadialGradient(
        x,
        y,
        BURST_RADIUS * 0.2,
        x,
        y,
        BURST_RADIUS,
      );
      halo.addColorStop(0, "rgba(255, 160, 70, 0.06)");
      halo.addColorStop(0.6, "rgba(255, 90, 20, 0.04)");
      halo.addColorStop(1, "rgba(120, 40, 5, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, BURST_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawFrame(x: number, y: number) {
      ctx.clearRect(0, 0, state.w, state.h);

      if (!state.enabled || !state.ready) return;

      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      for (const puff of state.particles) {
        puff.draw(ctx);
      }

      drawSmokeCloud(x, y);
      ctx.restore();
    }

    function resizeCanvas() {
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvasEl.width = state.w;
      canvasEl.height = state.h;
    }

    function onMouseMove(e: MouseEvent) {
      state.targetX = e.clientX;
      state.targetY = e.clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        state.targetX = e.touches[0].clientX;
        state.targetY = e.touches[0].clientY;
      }
    }

    function animate() {
      frameId = requestAnimationFrame(animate);

      state.currentX += (state.targetX - state.currentX) * 0.18;
      state.currentY += (state.targetY - state.currentY) * 0.18;

      const dx = state.currentX - state.prevX;
      const dy = state.currentY - state.prevY;
      const speed = Math.hypot(dx, dy);

      if (state.enabled && state.ready) {
        const spawnRate = speed > 6 ? 5 : 3;
        if (Math.random() < 0.82) {
          spawnSmoke(state.currentX, state.currentY, spawnRate);
        }
        if (speed > 14 && Math.random() < 0.35) {
          spawnSmoke(state.currentX, state.currentY, 6, true);
        }
      }

      state.prevX = state.currentX;
      state.prevY = state.currentY;

      updateParticles();
      drawFrame(state.currentX, state.currentY);
    }

    function activate() {
      state.ready = true;
      state.targetX = state.w * 0.5;
      state.targetY = state.h * 0.4;
      state.currentX = state.targetX;
      state.currentY = state.targetY;
      state.prevX = state.currentX;
      state.prevY = state.currentY;
      spawnSmoke(state.currentX, state.currentY, 18, true);
    }

    resizeCanvas();
    state.targetX = state.w * 0.5;
    state.targetY = state.h * 0.4;
    state.currentX = state.targetX;
    state.currentY = state.targetY;
    state.prevX = state.currentX;
    state.prevY = state.currentY;

    const onLoadingDone = () => activate();
    if (!document.body.classList.contains("ls-loading-active")) {
      activate();
    } else {
      state.ready = false;
      document.addEventListener("loadingComplete", onLoadingDone, { once: true });
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("loadingComplete", onLoadingDone);
      state.particles = [];
      ctx.clearRect(0, 0, state.w, state.h);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="smoke-canvas"
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-[45] mix-blend-screen transition-opacity duration-400 ${
        enabled ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}