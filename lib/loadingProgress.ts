export type LoadingMilestone =
  | "boot"
  | "fonts"
  | "window"
  | "hero"
  | "model"
  | "scene";

const MILESTONE_TARGET: Record<LoadingMilestone, number> = {
  boot: 12,
  fonts: 24,
  window: 42,
  hero: 58,
  model: 78,
  scene: 94,
};

let target = 0;
let displayed = 0;
let rafId = 0;
let creepTimer: ReturnType<typeof setInterval> | null = null;
let bound = false;

function getFillEl() {
  return document.getElementById("ls-progress-fill");
}

function getLabelEl() {
  return document.getElementById("ls-progress-label");
}

function render(progress: number) {
  const fill = getFillEl();
  const label = getLabelEl();
  const overlay = document.getElementById("ls-overlay");
  const clamped = Math.min(100, Math.max(0, progress));
  const rounded = Math.round(clamped);

  if (fill) {
    fill.style.transform = `scaleX(${clamped / 100})`;
  }
  if (label) {
    label.textContent = `${rounded}`;
  }
  if (overlay) {
    overlay.setAttribute("aria-valuenow", String(rounded));
  }
}

function animateFrame() {
  const delta = target - displayed;
  if (Math.abs(delta) < 0.08) {
    displayed = target;
    render(displayed);
    rafId = 0;
    return;
  }

  displayed += delta * 0.12;
  render(displayed);
  rafId = requestAnimationFrame(animateFrame);
}

function scheduleAnimate() {
  if (rafId) return;
  rafId = requestAnimationFrame(animateFrame);
}

function startCreep() {
  if (creepTimer) return;
  creepTimer = setInterval(() => {
    const ceiling = Math.min(target + 6, 99);
    if (displayed >= ceiling) return;
    target = Math.max(target, Math.min(ceiling, displayed + 0.35));
    scheduleAnimate();
  }, 120);
}

function stopCreep() {
  if (!creepTimer) return;
  clearInterval(creepTimer);
  creepTimer = null;
}

export function bindLoadingProgressUI() {
  if (bound || typeof document === "undefined") return;
  bound = true;
  render(0);
  startCreep();
}

export function reportLoadingMilestone(milestone: LoadingMilestone) {
  if (typeof document === "undefined") return;
  const next = MILESTONE_TARGET[milestone];
  if (next <= target) return;
  target = next;
  scheduleAnimate();
}

export function animateLoadingProgressTo(
  value: number,
  duration = 480,
): Promise<void> {
  return new Promise((resolve) => {
    const start = displayed;
    const end = Math.min(100, Math.max(start, value));
    const startTime = performance.now();

    stopCreep();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - t) ** 3;
      displayed = start + (end - start) * eased;
      target = Math.max(target, displayed);
      render(displayed);

      if (t < 1) {
        requestAnimationFrame(step);
        return;
      }

      displayed = end;
      target = end;
      render(end);
      resolve();
    };

    requestAnimationFrame(step);
  });
}

export function getLoadingProgress() {
  return displayed;
}

export function waitForLoadingMilestone(
  milestone: LoadingMilestone,
  timeoutMs = 12000,
): Promise<void> {
  return new Promise((resolve) => {
    const required = MILESTONE_TARGET[milestone];

    const finish = () => {
      document.removeEventListener("loadingMilestone", onProgress);
      clearTimeout(timer);
      resolve();
    };

    const onProgress = () => {
      if (target >= required) finish();
    };

    if (target >= required) {
      resolve();
      return;
    }

    const timer = setTimeout(finish, timeoutMs);
    document.addEventListener("loadingMilestone", onProgress);
  });
}

export function initLoadingMilestoneBridge() {
  if (typeof document === "undefined") return;

  const milestones: LoadingMilestone[] = [
    "boot",
    "fonts",
    "window",
    "hero",
    "model",
    "scene",
  ];

  milestones.forEach((name) => {
    document.addEventListener(`loading:${name}`, () => {
      reportLoadingMilestone(name);
      document.dispatchEvent(
        new CustomEvent("loadingMilestone", { detail: { name, target } }),
      );
    });
  });
}

export function emitLoadingMilestone(milestone: LoadingMilestone) {
  if (typeof document === "undefined") return;
  reportLoadingMilestone(milestone);
  document.dispatchEvent(new Event(`loading:${milestone}`));
  document.dispatchEvent(
    new CustomEvent("loadingMilestone", { detail: { name: milestone, target } }),
  );
}

export function teardownLoadingProgress() {
  stopCreep();
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  bound = false;
}