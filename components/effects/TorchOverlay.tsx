"use client";

import { useEffect, useRef } from "react";
import { useTorch } from "@/hooks/useTorch";

const SMOKE_MAX = 220;
const FADE_RATE = 0.014;

function turbulence(x: number, y: number, t: number) {
  return {
    ax: Math.sin(y * 0.008 + t * 0.7) * 0.35 + Math.cos(x * 0.006 - t * 0.5) * 0.25,
    ay: Math.cos(x * 0.007 + t * 0.6) * 0.28 + Math.sin(y * 0.005 + t * 0.4) * 0.2,
  };
}

class SmokePlume {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  growth: number;
  spin: number;
  angle: number;
  stretch: number;
  lobes: Array<{ ox: number; oy: number; scale: number }>;

  constructor(x: number, y: number, burst = false) {
    const spread = burst ? 55 : 28;
    this.x = x + (Math.random() - 0.5) * spread;
    this.y = y + (Math.random() - 0.5) * spread * 0.6;
    this.vx = (Math.random() - 0.5) * (burst ? 1.1 : 0.55);
    this.vy = -0.25 - Math.random() * (burst ? 0.9 : 0.45);
    this.maxLife = burst ? 160 + Math.random() * 80 : 200 + Math.random() * 120;
    this.life = this.maxLife;
    this.radius = burst ? 14 + Math.random() * 18 : 10 + Math.random() * 14;
    this.growth = 0.28 + Math.random() * 0.22;
    this.spin = (Math.random() - 0.5) * 0.012;
    this.angle = Math.random() * Math.PI * 2;
    this.stretch = 0.75 + Math.random() * 0.55;
    this.lobes = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => ({
      ox: (Math.random() - 0.5) * 0.65,
      oy: (Math.random() - 0.5) * 0.45,
      scale: 0.45 + Math.random() * 0.55,
    }));
  }

  update(time: number) {
    const turb = turbulence(this.x, this.y, time);
    this.vx += turb.ax * 0.06;
    this.vy += turb.ay * 0.04 - 0.018;
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.988;
    this.vy *= 0.99;
    this.radius += this.growth;
    this.angle += this.spin;
    this.life -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const age = 1 - this.life / this.maxLife;
    const fadeIn = Math.min(1, (1 - this.life / this.maxLife) * 8);
    const fadeOut = Math.pow(this.life / this.maxLife, 0.65);
    const alpha = fadeIn * fadeOut * 0.11;
    if (alpha < 0.004) return;

    const r = this.radius * (1 + age * 1.8);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(1, this.stretch);

    for (const lobe of this.lobes) {
      const lx = lobe.ox * r * 0.9;
      const ly = lobe.oy * r * 0.7;
      const lr = r * lobe.scale;
      const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);

      if (age < 0.18) {
        grad.addColorStop(0, `rgba(235, 200, 165, ${alpha * 1.1})`);
        grad.addColorStop(0.2, `rgba(210, 155, 110, ${alpha * 0.85})`);
        grad.addColorStop(0.45, `rgba(175, 130, 95, ${alpha * 0.5})`);
      } else if (age < 0.45) {
        grad.addColorStop(0, `rgba(195, 185, 175, ${alpha * 0.95})`);
        grad.addColorStop(0.3, `rgba(165, 158, 150, ${alpha * 0.6})`);
        grad.addColorStop(0.6, `rgba(130, 125, 120, ${alpha * 0.28})`);
      } else {
        grad.addColorStop(0, `rgba(155, 152, 148, ${alpha * 0.8})`);
        grad.addColorStop(0.35, `rgba(115, 112, 108, ${alpha * 0.45})`);
        grad.addColorStop(0.7, `rgba(85, 82, 78, ${alpha * 0.18})`);
      }
      grad.addColorStop(1, "rgba(60, 58, 55, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
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
    particles: [] as SmokePlume[],
    ready: false,
    enabled: true,
    time: 0,
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

    const buffer = document.createElement("canvas");
    const bufferCtxRaw = buffer.getContext("2d", { alpha: true });
    if (!bufferCtxRaw) return;
    const bctx: CanvasRenderingContext2D = bufferCtxRaw;

    const state = stateRef.current;
    let frameId = 0;

    function spawnSmoke(x: number, y: number, amount = 3, burst = false) {
      for (let i = 0; i < amount; i += 1) {
        if (state.particles.length < SMOKE_MAX) {
          state.particles.push(new SmokePlume(x, y, burst));
        }
      }
    }

    function updateParticles() {
      for (let i = state.particles.length - 1; i >= 0; i -= 1) {
        state.particles[i].update(state.time);
        if (state.particles[i].life <= 0) state.particles.splice(i, 1);
      }
    }

    function fadeBuffer() {
      bctx.globalCompositeOperation = "destination-out";
      bctx.fillStyle = `rgba(0, 0, 0, ${FADE_RATE})`;
      bctx.fillRect(0, 0, state.w, state.h);
      bctx.globalCompositeOperation = "source-over";
    }

    function paintEmitter(x: number, y: number) {
      bctx.save();
      bctx.globalCompositeOperation = "screen";

      const emit = bctx.createRadialGradient(x, y, 0, x, y, 42);
      emit.addColorStop(0, "rgba(220, 175, 130, 0.09)");
      emit.addColorStop(0.35, "rgba(190, 140, 95, 0.05)");
      emit.addColorStop(1, "rgba(100, 80, 65, 0)");
      bctx.fillStyle = emit;
      bctx.beginPath();
      bctx.arc(x, y, 42, 0, Math.PI * 2);
      bctx.fill();

      bctx.restore();
    }

    function drawFrame(x: number, y: number) {
      if (!state.enabled || !state.ready) {
        ctx.clearRect(0, 0, state.w, state.h);
        bctx.clearRect(0, 0, state.w, state.h);
        return;
      }

      fadeBuffer();

      bctx.save();
      bctx.globalCompositeOperation = "lighter";
      for (const plume of state.particles) {
        plume.draw(bctx);
      }
      bctx.restore();

      paintEmitter(x, y);

      ctx.clearRect(0, 0, state.w, state.h);
      ctx.globalAlpha = 0.92;
      ctx.drawImage(buffer, 0, 0);
      ctx.globalAlpha = 1;
    }

    function resizeCanvas() {
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvasEl.width = state.w;
      canvasEl.height = state.h;
      buffer.width = state.w;
      buffer.height = state.h;
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
      state.time += 0.016;

      state.currentX += (state.targetX - state.currentX) * 0.14;
      state.currentY += (state.targetY - state.currentY) * 0.14;

      const dx = state.currentX - state.prevX;
      const dy = state.currentY - state.prevY;
      const speed = Math.hypot(dx, dy);

      if (state.enabled && state.ready) {
        spawnSmoke(state.currentX, state.currentY + 6, speed > 4 ? 4 : 2);
        if (Math.random() < 0.55) {
          spawnSmoke(
            state.currentX + (Math.random() - 0.5) * 20,
            state.currentY + 8 + Math.random() * 10,
            2,
          );
        }
        if (speed > 10 && Math.random() < 0.4) {
          spawnSmoke(state.currentX, state.currentY + 4, 5, true);
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
      spawnSmoke(state.currentX, state.currentY + 8, 12, true);
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
      bctx.clearRect(0, 0, state.w, state.h);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="smoke-canvas"
      aria-hidden
      className={`pointer-events-none fixed top-0 left-0 z-[45] transition-opacity duration-400 ${
        enabled ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}