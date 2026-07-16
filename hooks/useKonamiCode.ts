"use client";
import { useEffect } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonamiCode(onActivate: () => void): void {
  useEffect(() => {
    let index = 0;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === KONAMI_SEQUENCE[index]) {
        index++;
        if (index === KONAMI_SEQUENCE.length) {
          index = 0;
          onActivate();
        }
      } else {
        // Reset to 0, or to 1 if the pressed key restarts the sequence
        index = e.key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onActivate]);
}