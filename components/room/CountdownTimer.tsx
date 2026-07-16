"use client";
import { useCountdown } from "@/hooks/useCountdown";
import { formatTime } from "@/lib/utils";

export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const seconds = useCountdown(expiresAt);
  return (
    // suppressHydrationWarning: the server renders "00:00" (initial 0) while the client
    // immediately calculates the real value in useEffect. The mismatch is intentional
    // and resolves within one paint, so we suppress the React warning here.
    <span suppressHydrationWarning className={`text-2xl font-light tabular-nums ${seconds < 60 ? "text-error" : "text-accent"}`}>
      {formatTime(seconds)}
    </span>
  );
}