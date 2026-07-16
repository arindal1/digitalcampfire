"use client";
import { useEffect, useRef } from "react";
import type { Message } from "@/types/room";
import { MessageBubble } from "./MessageBubble";

interface Props {
  messages: Message[];
  myUsername: string;
  gatheringLine?: string;
}

export function ChatArea({ messages, myUsername, gatheringLine }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-scroll flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 flex flex-col gap-4 min-h-0">
      {gatheringLine && (
        <p className="text-secondary/60 text-xs text-center italic px-4 pb-2 shrink-0">
          {gatheringLine}
        </p>
      )}
      {messages.length === 0 && (
        <p className="text-secondary text-sm text-center mt-8">
          The fire is lit. Be the first to speak.
        </p>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} isOwn={msg.username === myUsername} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}