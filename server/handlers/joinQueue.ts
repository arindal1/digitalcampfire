import type { Server, Socket } from "socket.io";
import type { Prisma } from "@prisma/client";
import type { ClientToServerEvents, ServerToClientEvents, RoomFoundPayload } from "@/types/socket";
import { enqueue, findMatch, removeGroup } from "../queue";
import { startRoomTimer } from "../rooms";
import prisma from "@/lib/prisma";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type S = Socket<ClientToServerEvents, ServerToClientEvents>;

// ISO 639-1 / 639-3 codes: 2–3 lowercase letters only
const LANG_CODE_RE = /^[a-z]{2,3}$/;

// Per-user join cooldown: prevents rapid re-queue spam
const joinCooldowns = new Map<string, number>();
const JOIN_COOLDOWN_MS = 5_000;

export const handleJoinQueue = async (
  io: IO,
  socket: S,
  userId: string,
  rawLanguages: string[]
): Promise<void> => {
  // Rate-limit: enforce a cooldown per user between joinQueue calls.
  // Prune expired entries first to prevent the Map from growing unbounded.
  const now = Date.now();
  for (const [uid, ts] of joinCooldowns) {
    if (now - ts >= JOIN_COOLDOWN_MS) joinCooldowns.delete(uid);
  }
  const lastJoin = joinCooldowns.get(userId) ?? 0;
  if (now - lastJoin < JOIN_COOLDOWN_MS) {
    socket.emit("appError", { code: "RATE_LIMITED", message: "Please wait before joining the queue again." });
    return;
  }
  joinCooldowns.set(userId, now);

  // Validate, sanitize, and deduplicate language codes.
  // Deduplication is critical: without it a user sending ["en","en","en"] would
  // count as 3 entries in the "en" matchmaking bucket, making a single user
  // appear to fill multiple slots toward the 5-user threshold.
  const languages = Array.isArray(rawLanguages)
    ? [...new Set(rawLanguages.filter((l): l is string => typeof l === "string" && LANG_CODE_RE.test(l)))].slice(0, 20)
    : [];

  if (languages.length === 0) {
    socket.emit("appError", { code: "INVALID_LANGUAGES", message: "Provide at least one valid language code." });
    return;
  }

  enqueue({ socketId: socket.id, userId, languages });

  const match = findMatch();
  if (!match) return;

  removeGroup(match.group);

  try {
    const { room, participantRows, expiresAt, verifiedMap } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const count = await tx.prompt.count();
      if (count === 0) throw new Error("No prompts available");

      const prompt = await tx.prompt.findFirst({ skip: Math.floor(Math.random() * count) });
      if (!prompt) throw new Error("No prompts available");

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

      const room = await tx.room.create({
        data: { language: match.language, prompt: prompt.content, startedAt: now, expiresAt },
      });

      // Fetch each matched user's real username from the DB
      const users = await tx.user.findMany({
        where: { id: { in: match.group.map((e) => e.userId) } },
        select: { id: true, username: true, verified: true },
      });
      const usernameMap = new Map(users.map((u: { id: string; username: string; verified: boolean }) => [u.id, u.username]));
      const verifiedMap = new Map(users.map((u: { id: string; username: string; verified: boolean }) => [u.id, u.verified]));

      const participantRows = await Promise.all(
        match.group.map((entry) =>
          tx.roomParticipant.create({
            data: {
              roomId: room.id,
              userId: entry.userId,
              username: usernameMap.get(entry.userId) ?? entry.userId,
            },
          })
        )
      );

      return { room, participantRows, expiresAt, verifiedMap };
    });

    const payload: RoomFoundPayload = {
      roomId: room.id,
      language: room.language,
      prompt: room.prompt,
      expiresAt: expiresAt.toISOString(),
      participants: participantRows.map((p: { userId: string; username: string }) => ({
        username: p.username,
        verified: verifiedMap.get(p.userId) ?? false,
      })),
    };

    for (const entry of match.group) io.to(entry.socketId).emit("roomFound", payload);
    startRoomTimer(io, room.id, expiresAt);
  } catch {
    // Re-enqueue all matched users so they can be re-matched
    for (const entry of match.group) enqueue(entry);
    for (const entry of match.group) {
      io.to(entry.socketId).emit("appError", {
        code: "MATCH_FAILED",
        message: "Failed to create room. Searching again…",
      });
    }
  }
};