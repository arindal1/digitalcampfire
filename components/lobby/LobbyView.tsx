"use client";

import { EmberBackground } from "../EmberBackground";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { LanguageTags } from "./LanguageTags";
import { QueueStatus } from "./QueueStatus";

interface Props {
  username: string;
  languages: string[];
}

export function LobbyView({ username, languages }: Props) {
  const { inQueue, joining, join, leave } = useMatchmaking(languages);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <EmberBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <p className="mb-10 text-xs uppercase tracking-[0.45em] text-secondary">
            DIGITAL CAMPFIRE
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