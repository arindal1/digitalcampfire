"use client";
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
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-secondary text-xs tracking-widest uppercase mb-10">Digital Campfire</p>
        <h1 className="text-3xl font-semibold mb-2">Welcome, {username}</h1>
        <p className="text-secondary text-sm mb-8">Ready for a conversation?</p>
        <LanguageTags languages={languages} />
        <div className="mt-12">
          {inQueue ? (
            <div className="flex flex-col items-center gap-6">
              <QueueStatus />
              <button
                onClick={leave}
                className="text-secondary text-sm hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                Leave queue
              </button>
            </div>
          ) : (
            <button
              onClick={join}
              disabled={joining}
              className="bg-accent text-black font-medium rounded-xl px-10 py-4 text-base hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {joining ? "Joining…" : "Join Campfire"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}