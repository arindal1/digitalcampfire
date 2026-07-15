"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Message } from "@/types/room";
import type { MessagePayload } from "@/types/socket";
import { getSocket } from "./useSocket";

export const useRoom = (roomId: string, myVerified = false) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    // Only emit joinRoom immediately if already connected.
    // If not yet connected, onReconnect handles it once the connection is established,
    // preventing the double-emit that would otherwise happen (buffered emit + connect event).
    if (socket.connected) {
      socket.emit("joinRoom", { roomId });
    }

    // Re-join the room channel after a reconnect so events keep flowing.
    const onReconnect = () => socket.emit("joinRoom", { roomId });

    const onMessage = (data: MessagePayload) => {
      setMessages((prev) => {
        // Match by tempId first (reliable), fall back to content+username for messages
        // sent before the tempId protocol was in place.
        const optimisticIdx = prev.findLastIndex(
          (m) =>
            m.pending &&
            (data.tempId ? m.id === data.tempId : m.content === data.content && m.username === data.username)
        );
        if (optimisticIdx !== -1) {
          return prev.map((m, i) =>
            i === optimisticIdx
              ? { id: data.messageId, username: data.username, content: data.content, createdAt: data.createdAt, verified: data.verified }
              : m
          );
        }
        return [
          ...prev,
          { id: data.messageId, username: data.username, content: data.content, createdAt: data.createdAt, verified: data.verified },
        ];
      });
    };

    const onRoomEnded = () => router.replace("/lobby");

    // Remove the stuck optimistic message if the server rejects it
    const onAppError = (err: { code: string }) => {
      if (
        err.code === "ROOM_EXPIRED" ||
        err.code === "NOT_PARTICIPANT" ||
        err.code === "RATE_LIMITED" ||
        err.code === "MESSAGE_TOO_LONG" ||
        err.code === "INVALID_MESSAGE"
      ) {
        setMessages((prev) => prev.filter((m) => !m.pending));
      }
    };

    socket.on("connect", onReconnect);
    socket.on("messageReceived", onMessage);
    socket.on("roomEnded", onRoomEnded);
    socket.on("appError", onAppError);

    return () => {
      socket.off("connect", onReconnect);
      socket.off("messageReceived", onMessage);
      socket.off("roomEnded", onRoomEnded);
      socket.off("appError", onAppError);
    };
  }, [roomId, router]);

  const sendMessage = useCallback(
    (content: string, myUsername: string) => {
      if (!content.trim() || content.length > 300) return;
      const tempId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: tempId, username: myUsername, content, createdAt: new Date().toISOString(), pending: true, verified: myVerified },
      ]);
      getSocket().emit("sendMessage", { roomId, content, tempId });
    },
    [roomId, myVerified]
  );

  return { messages, sendMessage };
};