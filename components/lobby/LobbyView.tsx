"use client";

import { useState, useRef, useCallback } from "react";
import { EmberBackground } from "../EmberBackground";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { LanguageTags } from "./LanguageTags";
import { QueueStatus } from "./QueueStatus";
import { VersionBadge } from "@/components/VersionBadge";
import { authClient } from "@/lib/auth-client";

const CAMPFIRE_CLICKS = 7;
const CAMPFIRE_WINDOW_MS = 3000;

interface Props {
  username: string;
  languages: string[];
  campfireCount: number;
}

export function LobbyView({ username, languages, campfireCount }: Props) {
  const { inQueue, joining, join, leave, timedOut, roomTransitioning } = useMatchmaking(languages);
  const [campfireSecret, setCampfireSecret] = useState(false);
  const campfireTimestamps = useRef<number[]>([]);

  const handleCampfireClick = useCallback(() => {
    if (campfireSecret) return;
    const now = Date.now();
    campfireTimestamps.current = [
      ...campfireTimestamps.current,
      now,
    ].filter((t) => now - t < CAMPFIRE_WINDOW_MS);
    if (campfireTimestamps.current.length >= CAMPFIRE_CLICKS) {
      campfireTimestamps.current = [];
      setCampfireSecret(true);
      setTimeout(() => setCampfireSecret(false), 4000);
    }
  }, [campfireSecret]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <EmberBackground />

      {/* Transition overlay: shown while navigating to the room after a match */}
      {roomTransitioning && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 text-center px-6">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <p className="text-xl font-semibold text-white">Travellers found!</p>
            <p className="text-sm text-secondary">Gathering around the fire…</p>
          </div>
        </div>
      )}

      {/* Top-right: sign out */}
      <button
        onClick={handleSignOut}
        className="absolute top-5 right-6 z-20 text-xs text-secondary transition-colors hover:text-white"
      >
        Sign out
      </button>

      {/* Bottom-right: version — triple-click to reveal creator credit */}
      <VersionBadge
        version="v0.4.0"
        className="absolute bottom-5 right-6 z-20 text-xs text-secondary/40"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p
            onClick={handleCampfireClick}
            className={`mb-10 cursor-default select-none text-xs uppercase tracking-[0.45em] transition-colors duration-700 ${
              campfireSecret ? "text-accent" : "text-secondary"
            }`}
          >
            {campfireSecret ? "a fire started by arindal1" : "DIGITAL CAMPFIRE"}
          </p>

          <h1 className="mb-3 text-4xl font-semibold">
            Welcome, {username}
          </h1>

          <p className="mb-8 text-secondary leading-7">
            The fire is warm.
            <br />
            Wait here until fellow travellers arrive.
          </p>

          {/* Personal campfire count — subtle, no leaderboard */}
          <p className="mb-8 text-xs text-accent tabular-nums">
            {campfireCount === 0
              ? "Your first fire awaits."
              : `${campfireCount} ${campfireCount === 1 ? "fire" : "fires"} sat at`}
          </p>

          <LanguageTags languages={languages} />

          <div className="mt-12">
            {inQueue ? (
              <div className="flex flex-col items-center gap-6">
                <QueueStatus />

                <button
                  onClick={leave}
                  className="text-sm text-secondary transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Leave queue
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={join}
                  disabled={joining}
                  className="rounded-xl bg-accent px-10 py-4 text-base font-medium text-black transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {joining ? "Finding a campfire..." : "Join Campfire"}
                </button>

                {timedOut && (
                  <p className="text-sm text-secondary/70">
                    Very few users online, try again later.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}