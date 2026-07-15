import type { Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";
import { dequeueByUserId } from "../queue";

export const handleLeaveQueue = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  userId: string
): void => {
  // Dequeue by userId so a reconnected socket (new socket.id) still clears the entry.
  void socket; // socket retained in signature for consistency; not used here
  dequeueByUserId(userId);
};