"use client";
import { useState, useRef, useCallback } from "react";

const REQUIRED_CLICKS = 3;
const CLICK_WINDOW_MS = 1500;

interface Props {
  version?: string;
  className?: string;
}

/**
 * Renders the app version. Triple-click within 1.5 s to reveal the creator
 * credit for 3 seconds, then quietly revert.
 */
export function VersionBadge({ version = "v0.8.2", className = "" }: Props) {
  const [revealed, setRevealed] = useState(false);
  const clickTimestamps = useRef<number[]>([]);

  const handleClick = useCallback(() => {
    if (revealed) return;
    const now = Date.now();
    clickTimestamps.current = [
      ...clickTimestamps.current,
      now,
    ].filter((t) => now - t < CLICK_WINDOW_MS);

    if (clickTimestamps.current.length >= REQUIRED_CLICKS) {
      clickTimestamps.current = [];
      setRevealed(true);
      setTimeout(() => setRevealed(false), 3000);
    }
  }, [revealed]);

  return (
    <p
      onClick={handleClick}
      className={`cursor-default select-none transition-colors duration-500 ${
        revealed ? "text-amber-200" : ""
      } ${className}`}
    >
      {revealed ? "made with 🔥 by arindal1" : version}
    </p>
  );
}