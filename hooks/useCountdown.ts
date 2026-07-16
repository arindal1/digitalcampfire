"use client";
import { useState, useEffect } from "react";

export const useCountdown = (expiresAt: string | null): number => {
  // Initialize to 0 for SSR so the server-rendered HTML always shows "00:00".
  // The real value is set inside useEffect, which only runs on the client.
  // This prevents the React hydration mismatch caused by Date.now() returning
  // slightly different values on the server vs. the client.
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const calc = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    setSeconds(calc());
    const id = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return seconds;
};