"use client";
import { useState, useEffect } from "react";

export const useCountdown = (expiresAt: string | null): number => {
  const [seconds, setSeconds] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 0
  );

  useEffect(() => {
    if (!expiresAt) return;
    const calc = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    setSeconds(calc());
    const id = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return seconds;
};