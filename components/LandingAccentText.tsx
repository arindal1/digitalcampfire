"use client";
import { useState, useRef, useCallback } from "react";

const REQUIRED_CLICKS = 5;
const CLICK_WINDOW_MS = 2500;

/**
 * The "Rest awhile." accent text on the landing page.
 * Click it 5 times within 2.5 s to reveal a brief secret message.
 */
export function LandingAccentText() {
  const [secret, setSecret] = useState(false);
  const clickTimestamps = useRef<number[]>([]);

  const handleClick = useCallback(() => {
    if (secret) return;
    const now = Date.now();
    clickTimestamps.current = [
      ...clickTimestamps.current,
      now,
    ].filter((t) => now - t < CLICK_WINDOW_MS);

    if (clickTimestamps.current.length >= REQUIRED_CLICKS) {
      clickTimestamps.current = [];
      setSecret(true);
      setTimeout(() => setSecret(false), 3500);
    }
  }, [secret]);

  return (
    <span
      onClick={handleClick}
      className={`cursor-default select-none transition-all duration-700 ${
        secret ? "text-white/80 italic" : "text-accent"
      }`}
    >
      {secret ? "Still burning." : "Rest awhile."}
    </span>
  );
}