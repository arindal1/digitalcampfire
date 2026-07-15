"use client";
import { useEffect, useRef } from "react";
import type { Message } from "@/types/room";
import { MessageBubble } from "./MessageBubble";

interface Props { messages: Message[]; myUsername: string }

export function ChatArea({ messages, myUsername }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 min-h-0">
      {messages.length === 0 && (
        <p className="text-secondary text-sm text-center mt-12">
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