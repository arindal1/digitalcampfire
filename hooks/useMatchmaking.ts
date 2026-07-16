"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RoomFoundPayload } from "@/types/socket";
import { getSocket } from "./useSocket";

export const useMatchmaking = (languages: string[]) => {
  const [inQueue, setInQueue] = useState(false);
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  // Ref mirrors inQueue so the effect cleanup can read the latest value without
  // being listed as a dependency (which would re-register listeners on every
  // queue state change). Updated synchronously alongside every setInQueue call.
  const inQueueRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onRoomFound = (data: RoomFoundPayload) => {
      // Mark dequeued before the state update so the cleanup never fires leaveQueue
      // after a successful match (even if React batches the state update).
      inQueueRef.current = false;
      setInQueue(false);
      router.push(`/room/${data.roomId}`);
    };

    // Reset queue state only on errors where the server also drops the user from the queue.
    // MATCH_FAILED is NOT included: the server re-enqueues all 5 matched users automatically,
    // so the client should stay in the "searching" state rather than showing the button again.
    const onAppError = (err: { code: string }) => {
      if (err.code === "RATE_LIMITED" || err.code === "INVALID_LANGUAGES") {
        inQueueRef.current = false;
        setInQueue(false);
      }
    };

    socket.on("roomFound", onRoomFound);
    socket.on("appError", onAppError);

    return () => {
      socket.off("roomFound", onRoomFound);
      socket.off("appError", onAppError);
      // If the user is still in the queue when the lobby unmounts (e.g. they
      // navigated away without clicking "Leave queue"), clean up their queue
      // entry. Without this the server keeps them queued and they can become a
      // ghost participant in the next matched room.
      if (inQueueRef.current) {
        socket.emit("leaveQueue");
        fetch("/api/queue/leave", { method: "POST" }).catch(() => {});
        inQueueRef.current = false;
      }
    };
  }, [router]);

  const join = useCallback(async () => {
    if (joining || inQueue) return;
    setJoining(true);
    try {
      const res = await fetch("/api/queue/join", { method: "POST" });
      if (!res.ok) return;
      const socket = getSocket();
      socket.emit("joinQueue", { languages });
      inQueueRef.current = true;
      setInQueue(true);
    } catch {
      // Network error - joining resets via finally so the button re-enables
    } finally {
      setJoining(false);
    }
  }, [languages, inQueue, joining]);

  const leave = useCallback(async () => {
    inQueueRef.current = false;
    setInQueue(false);
    const socket = getSocket();
    socket.emit("leaveQueue");
    await fetch("/api/queue/leave", { method: "POST" });
  }, []);

  return { inQueue, joining, join, leave };
};