"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { RoomFoundPayload } from "@/types/socket";
import { getSocket } from "./useSocket";

export const useMatchmaking = (languages: string[]) => {
  const [inQueue, setInQueue] = useState(false);
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onRoomFound = (data: RoomFoundPayload) => {
      setInQueue(false);
      router.push(`/room/${data.roomId}`);
    };

    // Reset queue state only on errors where the server also drops the user from the queue.
    // MATCH_FAILED is NOT included: the server re-enqueues all 5 matched users automatically,
    // so the client should stay in the "searching" state rather than showing the button again.
    const onAppError = (err: { code: string }) => {
      if (err.code === "RATE_LIMITED" || err.code === "INVALID_LANGUAGES") {
        setInQueue(false);
      }
    };

    socket.on("roomFound", onRoomFound);
    socket.on("appError", onAppError);
    return () => {
      socket.off("roomFound", onRoomFound);
      socket.off("appError", onAppError);
    };
  }, [router]);

  const join = useCallback(async () => {
    if (joining || inQueue) return;
    setJoining(true);
    const res = await fetch("/api/queue/join", { method: "POST" });
    setJoining(false);
    if (!res.ok) return;
    const socket = getSocket();
    socket.emit("joinQueue", { languages });
    setInQueue(true);
  }, [languages, inQueue, joining]);

  const leave = useCallback(async () => {
    const socket = getSocket();
    socket.emit("leaveQueue");
    await fetch("/api/queue/leave", { method: "POST" });
    setInQueue(false);
  }, []);

  return { inQueue, joining, join, leave };
};