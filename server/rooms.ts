import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, ReplayData } from "@/types/socket";
import prisma from "@/lib/prisma";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;

const timers = new Map<string, NodeJS.Timeout>();

export const startRoomTimer = (io: IO, roomId: string, expiresAt: Date): void => {
  // Guard: if a timer is already running for this room, don't create a second one
  if (timers.has(roomId)) return;

  // Tick only drives room expiry - the client calculates its own countdown from expiresAt.
  const tick = () => {
    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    if (remaining <= 0) void closeRoom(io, roomId);
  };
  timers.set(roomId, setInterval(tick, 1000));
};

/**
 * Core cleanup: writes analytics, deletes the room (cascades messages + participants),
 * notifies all connected clients, and removes them from the socket channel.
 * Safe to call whether or not a timer is currently running for the room.
 */
const doCloseRoom = async (io: IO, roomId: string): Promise<void> => {
  // Fallback replay data used if DB is unavailable or the room is already gone.
  const emptyReplay: ReplayData = {
    prompt: "",
    language: "",
    languages: [],
    heatmap: Array(15).fill(0) as number[],
    totalMessages: 0,
    startedAt: new Date().toISOString(),
  };
  let replay: ReplayData = emptyReplay;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        messages: {
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        participants: {
          include: { user: { select: { id: true, languages: true } } },
        },
      },
    });

    if (room) {
      // Build 15-bucket heatmap (one bucket per minute of the 15-min session).
      const heatmap = Array(15).fill(0) as number[];
      for (const msg of room.messages) {
        const minute = Math.min(
          14,
          Math.max(0, Math.floor((msg.createdAt.getTime() - room.startedAt.getTime()) / 60_000))
        );
        heatmap[minute]++;
      }

      // Collect all unique language codes spoken by the participants.
      const langSet = new Set<string>([room.language]);
      for (const p of room.participants) {
        try {
          const langs = JSON.parse(p.user.languages) as string[];
          if (Array.isArray(langs)) langs.forEach((l) => typeof l === "string" && langSet.add(l));
        } catch {
          /* malformed JSON — skip */
        }
      }

      replay = {
        prompt: room.prompt,
        language: room.language,
        languages: Array.from(langSet),
        heatmap,
        totalMessages: room.messages.length,
        startedAt: room.startedAt.toISOString(),
      };

      // Increment each participant's all-time campfire count (non-critical).
      try {
        await prisma.user.updateMany({
          where: { id: { in: room.participants.map((p) => p.userId) } },
          data: { campfireCount: { increment: 1 } },
        });
      } catch (err) {
        console.error(`[closeRoom] campfireCount increment failed for room ${roomId}:`, err);
      }

      // Analytics is non-critical — don't let a write failure block room cleanup.
      try {
        await prisma.analytics.create({
          data: {
            prompt: room.prompt,
            closedAt: new Date(),
            heatmap: JSON.stringify(heatmap),
            languages: JSON.stringify(Array.from(langSet)),
          },
        });
      } catch (err) {
        console.error(`[closeRoom] analytics write failed for room ${roomId}:`, err);
      }

      await prisma.room.delete({ where: { id: roomId } }); // cascades messages + participants
    }
  } catch (err) {
    console.error(`[closeRoom] DB cleanup failed for room ${roomId}:`, err);
    // Fall through: still emit roomEnded so clients are never permanently stuck.
  } finally {
    io.to(roomId).emit("roomEnded", replay);
    io.in(roomId).socketsLeave(roomId);
  }
};

const closeRoom = async (io: IO, roomId: string): Promise<void> => {
  const timer = timers.get(roomId);
  // If no timer is found, closeRoom is already in progress for this room - bail out
  if (!timer) return;
  clearInterval(timer);
  timers.delete(roomId);
  await doCloseRoom(io, roomId);
};

/**
 * Called once on server startup to handle rooms that were active when the process
 * last exited. Without this, rooms lose their timers on restart and roomEnded never
 * fires, leaving users permanently stuck on the room page.
 */
export const recoverRooms = async (io: IO): Promise<void> => {
  const now = new Date();
  const [expiredRooms, activeRooms] = await Promise.all([
    prisma.room.findMany({ where: { expiresAt: { lte: now } } }),
    prisma.room.findMany({ where: { expiresAt: { gt: now } } }),
  ]);

  if (expiredRooms.length > 0) {
    console.log(`[recoverRooms] Cleaning up ${expiredRooms.length} expired room(s)…`);
    await Promise.all(expiredRooms.map((room) => doCloseRoom(io, room.id)));
  }

  if (activeRooms.length > 0) {
    console.log(`[recoverRooms] Restarting timers for ${activeRooms.length} active room(s)…`);
    for (const room of activeRooms) {
      startRoomTimer(io, room.id, room.expiresAt);
    }
  }
};