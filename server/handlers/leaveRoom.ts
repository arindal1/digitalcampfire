import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type S = Socket<ClientToServerEvents, ServerToClientEvents>;

const ROOM_ID_RE = /^[a-zA-Z0-9_-]{10,40}$/;

export const handleLeaveRoom = (io: IO, socket: S, roomId: string): void => {
  if (!ROOM_ID_RE.test(roomId)) return;
  socket.leave(roomId);
  // Notify remaining participants that the count has decreased
  io.to(roomId).emit("participantLeft");
};