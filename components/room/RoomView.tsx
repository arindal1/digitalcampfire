"use client";
import type { RoomData } from "@/types/room";
import { useRoom } from "@/hooks/useRoom";
import { VersionBadge } from "@/components/VersionBadge";
import { PromptBanner } from "./PromptBanner";
import { CountdownTimer } from "./CountdownTimer";
import { ChatArea } from "./ChatArea";
import { MessageInput } from "./MessageInput";
import { ParticipantCount } from "./ParticipantCount";
import { CampfireReplay } from "./CampfireReplay";

interface Props { room: RoomData; }

export function RoomView({ room }: Props) {
  const myVerified = room.participants.find((p) => p.username === room.myUsername)?.verified ?? false;
  const { messages, sendMessage, participantCount, leaveRoom, replayData } = useRoom(room.id, myVerified, room.participants.length);

  if (replayData) {
    return <CampfireReplay data={replayData} />;
  }

  const gatheringLine =
    room.participants.map((p) => p.username).join(", ") +
    (room.participants.length === 1 ? " has" : " have") +
    " gathered around the fire.";

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto overflow-hidden">
      <header className="shrink-0 bg-background/95 backdrop-blur-sm border-b border-white/8 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <PromptBanner prompt={room.prompt} />
          <button
            onClick={leaveRoom}
            className="shrink-0 mt-0.5 text-xs text-secondary transition-colors hover:text-error"
            title="Leave room"
          >
            Leave
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <ParticipantCount count={participantCount} />
          <CountdownTimer expiresAt={room.expiresAt} />
        </div>
      </header>

      <ChatArea messages={messages} myUsername={room.myUsername} gatheringLine={gatheringLine} />

      <footer className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-white/8 px-5 py-4">
        <MessageInput onSend={(content) => sendMessage(content, room.myUsername)} />
        {/* Triple-click the version badge to reveal creator credit */}
        <VersionBadge version="v0.8.0" className="mt-2 text-right text-[10px] text-secondary/30" />
      </footer>
    </div>
  );
}