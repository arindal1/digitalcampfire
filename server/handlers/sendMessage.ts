import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";
import prisma from "@/lib/prisma";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type S = Socket<ClientToServerEvents, ServerToClientEvents>;

// CUID / CUID2 / UUID-ish: reject obviously invalid roomId strings before hitting the DB
const ROOM_ID_RE = /^[a-zA-Z0-9_-]{10,40}$/;

// Per-user sliding-window rate limiter: max 5 messages per 3 seconds
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 3_000;
const RATE_MAX = 5;

export const handleSendMessage = async (
  io: IO,
  socket: S,
  data: { roomId: string; content: string; tempId?: string },
  userId: string
): Promise<void> => {
  // Rate limit check — prune expired entries first to prevent Map from growing unbounded
  const now = Date.now();
  for (const [uid, entry] of rateLimits) {
    if (now > entry.resetAt) rateLimits.delete(uid);
  }
  const rl = rateLimits.get(userId) ?? { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > rl.resetAt) {
    rl.count = 0;
    rl.resetAt = now + RATE_WINDOW_MS;
  }
  rl.count++;
  rateLimits.set(userId, rl);
  if (rl.count > RATE_MAX) {
    socket.emit("appError", { code: "RATE_LIMITED", message: "Slow down — too many messages." });
    return;
  }

  if (!ROOM_ID_RE.test(data.roomId)) {
    socket.emit("appError", { code: "ROOM_NOT_FOUND", message: "Room not found." });
    return;
  }

  if (!data.content?.trim()) {
    socket.emit("appError", { code: "INVALID_MESSAGE", message: "Message cannot be empty." });
    return;
  }
  if (data.content.length > 300) {
    socket.emit("appError", { code: "MESSAGE_TOO_LONG", message: "Max 300 characters." });
    return;
  }

  // Sanitize optional client-supplied tempId (echoed back for optimistic-UI matching)
  const tempId = typeof data.tempId === "string" ? data.tempId.slice(0, 64) : undefined;

  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId: data.roomId, userId } },
    include: { user: { select: { verified: true } } },
  });
  if (!participant) {
    socket.emit("appError", { code: "NOT_PARTICIPANT", message: "Not a room participant." });
    return;
  }

  try {
    const message = await prisma.message.create({
      data: { roomId: data.roomId, userId, content: data.content.trim() },
    });

    io.to(data.roomId).emit("messageReceived", {
      messageId: message.id,
      username: participant.username,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      tempId,
      verified: participant.user.verified,
    });
  } catch {
    // Room was deleted (expired) concurrently — inform sender
    socket.emit("appError", { code: "ROOM_EXPIRED", message: "This room has already ended." });
  }
};