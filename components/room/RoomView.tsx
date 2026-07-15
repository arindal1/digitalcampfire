"use client";
import type { RoomData } from "@/types/room";
import { useRoom } from "@/hooks/useRoom";
import { PromptBanner } from "./PromptBanner";
import { CountdownTimer } from "./CountdownTimer";
import { ChatArea } from "./ChatArea";
import { MessageInput } from "./MessageInput";
import { ParticipantCount } from "./ParticipantCount";

interface Props { room: RoomData; }

export function RoomView({ room }: Props) {
  const myVerified = room.participants.find((p) => p.username === room.myUsername)?.verified ?? false;
  const { messages, sendMessage } = useRoom(room.id, myVerified);

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto">
      <header className="shrink-0 bg-background border-b border-white/8 px-4 py-4">
        <PromptBanner prompt={room.prompt} />
        <div className="flex items-center justify-between mt-3">
          <ParticipantCount count={room.participants.length} />
          <CountdownTimer expiresAt={room.expiresAt} />
        </div>
      </header>
      <ChatArea messages={messages} myUsername={room.myUsername} />
      <footer className="shrink-0 bg-background border-t border-white/8 px-4 py-4">
        <MessageInput onSend={(content) => sendMessage(content, room.myUsername)} />
      </footer>
    </div>
  );
}