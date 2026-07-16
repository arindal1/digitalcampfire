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
}

export function LobbyView({ username, languages }: Props) {
  const { inQueue, joining, join, leave } = useMatchmaking(languages);
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

          <p className="mb-10 text-secondary leading-7">
            The fire is warm.
            <br />
            Wait here until fellow travellers arrive.
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
              <button
                onClick={join}
                disabled={joining}
                className="rounded-xl bg-accent px-10 py-4 text-base font-medium text-black transition-all hover:brightness-110 disabled:opacity-50"
              >
                {joining ? "Finding a campfire..." : "Join Campfire"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}