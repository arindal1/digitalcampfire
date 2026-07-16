"use client";
import { useState, useCallback, useEffect } from "react";
import { useKonamiCode } from "@/hooks/useKonamiCode";

export function EasterEgg() {
  const [visible, setVisible] = useState(false);

  const activate = useCallback(() => {
    setVisible(true);
  }, []);

  useKonamiCode(activate);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(id);
  }, [visible]);

  if (!visible) return null;

  return (
    // Click anywhere to dismiss
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={() => setVisible(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Ember glow */}
      <div className="absolute h-64 w-64 rounded-full bg-accent/15 blur-[80px]" />

      {/* Card */}
      <div className="relative z-10 mx-6 w-full max-w-sm rounded-2xl border border-accent/25 bg-surface/90 px-8 py-10 text-center shadow-xl">
        <p className="mb-7 font-mono text-[11px] tracking-[0.35em] text-accent">
          ↑ ↑ ↓ ↓ ← → ← → B A
        </p>

        <p className="mb-3 text-xl font-semibold text-white">
          You found the hidden path.
        </p>

        <p className="mb-8 text-sm leading-7 text-secondary">
          Not all who wander are lost.
          <br />
          The campfire burns brighter for the curious.
        </p>

        <p className="text-xs text-accent/60">~ arindal1</p>

        <p className="mt-6 text-[10px] text-secondary/40">
          click anywhere to close
        </p>
      </div>
    </div>
  );
}