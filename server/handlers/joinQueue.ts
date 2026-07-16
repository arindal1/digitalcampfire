import type { Server, Socket } from "socket.io";
import type { Prisma } from "@prisma/client";
import type { ClientToServerEvents, ServerToClientEvents, RoomFoundPayload } from "@/types/socket";
import { enqueue, findMatch, removeGroup } from "../queue";
import { startRoomTimer } from "../rooms";
import { parseLanguages } from "@/lib/utils";
import prisma from "@/lib/prisma";

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type S = Socket<ClientToServerEvents, ServerToClientEvents>;

// Per-user join cooldown: prevents rapid re-queue spam
const joinCooldowns = new Map<string, number>();
const JOIN_COOLDOWN_MS = 5_000;

export const handleJoinQueue = async (
  io: IO,
  socket: S,
  userId: string,
  // The client-supplied languages are intentionally ignored: the server always
  // fetches the user's registered languages from the DB. Trusting the client
  // payload would let a malicious user spoof extra languages to dominate the
  // matchmaking buckets or force matches with specific language groups.
  _rawLanguages: string[]
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

  // Fetch the user's real registered languages from the DB.
  // Deduplication via Set is still applied to guard against any corrupt DB data.
  const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { languages: true } });
  if (!userRecord) {
    socket.emit("appError", { code: "INVALID_LANGUAGES", message: "User not found." });
    return;
  }
  const languages = [...new Set(parseLanguages(userRecord.languages))];

  if (languages.length === 0) {
    socket.emit("appError", { code: "INVALID_LANGUAGES", message: "No languages registered on your account." });
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

      // orderBy ensures a stable cursor order so the random skip lands on the
      // correct record regardless of how PostgreSQL iterates the table.
      const prompt = await tx.prompt.findFirst({ orderBy: { id: "asc" }, skip: Math.floor(Math.random() * count) });
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