"use client";
import { useCountdown } from "@/hooks/useCountdown";
import { formatTime } from "@/lib/utils";

export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const seconds = useCountdown(expiresAt);
  return (
    <span className={`text-2xl font-light tabular-nums ${seconds < 60 ? "text-error" : "text-accent"}`}>
      {formatTime(seconds)}
    </span>
  );
}