"use client";

import { useTorch } from "@/hooks/useTorch";

export default function TorchToggle() {
  const { enabled, setEnabled } = useTorch();

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      <span
        className={`hidden text-xs font-medium tracking-wide transition-colors md:inline ${
          enabled ? "text-white/60" : "text-white/40"
        }`}
      >
        {enabled ? "Smoke on" : "Smoke off"}
      </span>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="peer sr-only"
          aria-label="Attiva o disattiva effetto fumogeno"
        />
        <span className="relative h-6 w-11 rounded-full bg-white/20 transition-colors peer-checked:bg-brand after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}