import type { Server as HTTPServer } from "node:http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";
import { auth } from "@/lib/auth";
import { dequeueBySocketId } from "./queue";
import { handleJoinQueue } from "./handlers/joinQueue";
import { handleLeaveQueue } from "./handlers/leaveQueue";
import { handleJoinRoom } from "./handlers/joinRoom";
import { handleSendMessage } from "./handlers/sendMessage";
import { recoverRooms } from "./rooms";
import prisma from "@/lib/prisma";

// Neon PostgreSQL scales to zero after 5 minutes of inactivity, causing ~2-4s
// cold-start delays for users. Pinging every 4 minutes (safely under the
// threshold) keeps the compute branch warm.
// Set DISABLE_DB_KEEPALIVE=true in .env.local to let the DB scale to zero
// (e.g. when the server is intentionally idle overnight).
const DB_KEEPALIVE_INTERVAL_MS = 4 * 60 * 1_000; // 4 minutes

const startDbKeepalive = (): (() => void) => {
  if (process.env.DISABLE_DB_KEEPALIVE === "true") {
    console.log("[keepalive] DB keep-alive disabled via DISABLE_DB_KEEPALIVE");
    return () => {};
  }
  const id = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      // Swallow — a failed ping is non-fatal; the DB will wake on the next real request
    }
  }, DB_KEEPALIVE_INTERVAL_MS);
  // Allow the Node process to exit even if this interval is still registered
  id.unref?.();
  console.log(`[keepalive] DB keep-alive started (interval: ${DB_KEEPALIVE_INTERVAL_MS / 1000}s)`);
  return () => clearInterval(id);
};

// Extend socket.data with a verified userId (set by auth middleware, never from client input)
type SocketData = { userId: string };

export const initSocketServer = (httpServer: HTTPServer): void => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      credentials: true,
    },
    // Limit individual message payload size to 64 KB.
    // The default (1 MB) is far too large for this app's text-only messages
    // and would allow a malicious client to waste significant server memory.
    maxHttpBufferSize: 64 * 1024,
  });

  // On startup, recover any rooms that were active when the server last exited.
  // Without this, rooms lose their expiry timers on restart and roomEnded never fires.
  void recoverRooms(io);

  startDbKeepalive();

  // Authenticate every socket connection using the Better Auth session cookie.
  // Rejects unauthenticated connections before any event handler runs.
  io.use(async (socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) return next(new Error("Unauthorized"));
    try {
      const session = await auth.api.getSession({ headers: new Headers({ cookie }) });
      if (!session) return next(new Error("Unauthorized"));
      socket.data.userId = session.user.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // userId is server-verified via the auth middleware - never trust client-supplied values
    const userId = socket.data.userId;

    socket.on("joinQueue", (data) => {
      void handleJoinQueue(io, socket, userId, data.languages);
    });

    socket.on("leaveQueue", () => handleLeaveQueue(socket, userId));

    socket.on("joinRoom", (data) => {
      void handleJoinRoom(socket, userId, data.roomId);
    });

    socket.on("sendMessage", (data) => {
      void handleSendMessage(io, socket, data, userId);
    });

    socket.on("disconnect", () => {
      dequeueBySocketId(socket.id);
    });
  });
};