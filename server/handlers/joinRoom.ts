import type { Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";
import prisma from "@/lib/prisma";

// CUID / CUID2 / UUID-ish: reject obviously invalid roomId strings before hitting the DB
const ROOM_ID_RE = /^[a-zA-Z0-9_-]{10,40}$/;

export const handleJoinRoom = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  userId: string,
  roomId: string
): Promise<void> => {
  if (!ROOM_ID_RE.test(roomId)) {
    socket.emit("appError", { code: "ROOM_NOT_FOUND", message: "Room not found." });
    return;
  }

  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId, userId } },
    include: { room: { select: { expiresAt: true } } },
  });
  if (!participant) {
    socket.emit("appError", { code: "NOT_PARTICIPANT", message: "Not a room participant." });
    return;
  }

  // Refuse to join a room that has already expired. The cleanup timer will fire
  // shortly and emit roomEnded, but we shouldn't let new socket joins happen.
  if (participant.room.expiresAt <= new Date()) {
    socket.emit("appError", { code: "ROOM_EXPIRED", message: "This room has already ended." });
    return;
  }

  // Leave any stale room channels from previous sessions before joining the new
  // room. The socket is a long-lived singleton on the client; without this, a
  // socket that missed its own socketsLeave (e.g. was offline when roomEnded
  // fired) would remain subscribed to a dead room channel. If that channel
  // later receives a roomEnded broadcast (e.g. from recoverRooms on restart),
  // the client would be incorrectly redirected to lobby.
  for (const room of socket.rooms) {
    if (room !== socket.id) socket.leave(room);
  }

  socket.join(roomId);
};