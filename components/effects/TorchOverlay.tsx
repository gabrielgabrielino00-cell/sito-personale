"use client";

import { useEffect, useRef } from "react";
import { useTorch } from "@/hooks/useTorch";

const DARK_OPACITY = 0.93;
const LIGHT_RADIUS = 460;
const ORANGE_INTENSITY = 0.85;

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;

  constructor(x: number, y: number) {
    this.x = x + (Math.random() - 0.5) * 60;
    this.y = y + (Math.random() - 0.5) * 60;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.life = 70 + Math.random() * 60;
    this.maxLife = this.life;
    this.size = 1.5 + Math.random() * 2.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.life -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = (this.life / this.maxLife) * 0.6;
    ctx.fillStyle = `rgba(255, 190, 80, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
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
    particles: [] as Particle[],
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

    const flareOffsets = [
      { ox: 65, oy: -45, r: 18, alpha: 0.55 },
      { ox: 115, oy: -75, r: 11, alpha: 0.35 },
      { ox: -35, oy: 55, r: 14, alpha: 0.4 },
    ];

    function spawnParticles(x: number, y: number, amount = 3) {
      for (let i = 0; i < amount; i += 1) {
        if (state.particles.length < 90) {
          state.particles.push(new Particle(x, y));
        }
      }
    }

    function updateParticles() {
      for (let i = state.particles.length - 1; i >= 0; i -= 1) {
        state.particles[i].update();
        if (state.particles[i].life <= 0) state.particles.splice(i, 1);
      }
    }

    function drawParticles() {
      for (const particle of state.particles) {
        particle.draw(ctx);
      }
    }

    function drawTorch(x: number, y: number) {
      if (!state.enabled || !state.ready) {
        ctx.clearRect(0, 0, state.w, state.h);
        return;
      }

      ctx.fillStyle = `rgba(8, 8, 14, ${DARK_OPACITY})`;
      ctx.fillRect(0, 0, state.w, state.h);

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";

      const grad = ctx.createRadialGradient(x, y, 35, x, y, LIGHT_RADIUS);
      grad.addColorStop(0, "rgba(255,255,255,0.95)");
      grad.addColorStop(0.35, "rgba(255,245,210,0.65)");
      grad.addColorStop(0.7, "rgba(255,180,80,0.15)");
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, LIGHT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.globalCompositeOperation = "lighter";

      const core = ctx.createRadialGradient(x, y, 8, x, y, 95);
      core.addColorStop(0, `rgba(255, 210, 90, ${ORANGE_INTENSITY})`);
      core.addColorStop(0.4, `rgba(255, 150, 40, ${ORANGE_INTENSITY * 0.7})`);
      core.addColorStop(1, "rgba(255, 100, 20, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(x, y, 110, 0, Math.PI * 2);
      ctx.fill();

      const outer = ctx.createRadialGradient(
        x,
        y,
        70,
        x,
        y,
        LIGHT_RADIUS * 0.95,
      );
      outer.addColorStop(0, "rgba(255, 130, 25, 0.18)");
      outer.addColorStop(1, "rgba(255, 80, 10, 0)");
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(x, y, LIGHT_RADIUS * 0.95, 0, Math.PI * 2);
      ctx.fill();

      for (const flare of flareOffsets) {
        ctx.fillStyle = `rgba(255, 220, 140, ${flare.alpha})`;
        ctx.beginPath();
        ctx.arc(x + flare.ox, y + flare.oy, flare.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      drawParticles();
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

      state.currentX += (state.targetX - state.currentX) * 0.23;
      state.currentY += (state.targetY - state.currentY) * 0.23;

      if (state.enabled && state.ready && Math.random() < 0.65) {
        spawnParticles(state.currentX, state.currentY, 2);
      }

      updateParticles();
      drawTorch(state.currentX, state.currentY);
    }

    function activate() {
      state.ready = true;
      state.targetX = state.w * 0.5;
      state.targetY = state.h * 0.35;
      state.currentX = state.targetX;
      state.currentY = state.targetY;
      window.setTimeout(() => {
        for (let i = 0; i < 25; i += 1) {
          state.particles.push(new Particle(state.currentX, state.currentY));
        }
      }, 300);
    }

    resizeCanvas();
    state.targetX = state.w * 0.5;
    state.targetY = state.h * 0.35;
    state.currentX = state.targetX;
    state.currentY = state.targetY;

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
      id="torch-canvas"
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-[45] transition-opacity duration-400 ${
        enabled ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}