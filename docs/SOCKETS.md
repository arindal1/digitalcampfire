# Socket Events - Digital Campfire

Library: **Socket.IO**
Transport: WebSocket (with HTTP long-poll fallback)

---

## Connection

Clients connect once on app load (or on `/lobby` entry).
The socket instance is a singleton managed in `lib/socket-client.ts`.

```ts
// lib/socket-client.ts
import { io, Socket } from "socket.io-client";

let socket: Socket;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,   // Send session cookie for auth
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}
```

---

## Events Reference

### Client → Server (Emitted by browser)

---

#### `joinQueue`

User requests to enter matchmaking.

```ts
socket.emit("joinQueue", {
  languages: string[],  // ISO codes: ["en", "hi"] - userId resolved server-side from session
});
```

**Server behavior:**
- Adds user to in-memory queue
- Runs language overlap check against existing queue
- If 5 compatible users found → creates room, emits `roomFound` to all 5

---

#### `leaveQueue`

User cancels matchmaking.

```ts
socket.emit("leaveQueue");
// userId resolved server-side from authenticated socket session
```

**Server behavior:**
- Removes user from in-memory queue by `userId`

---

#### `joinRoom`

User enters a room (on page load of `/room/[id]`).

```ts
socket.emit("joinRoom", {
  roomId: string,
  // userId resolved server-side from authenticated socket session
});
```

**Server behavior:**
- `socket.join(roomId)` - adds socket to room channel
- Validates user is a participant in that room (DB check)
- Emits nothing back (client already has room data from REST)

---

#### `sendMessage`

User sends a chat message.

```ts
socket.emit("sendMessage", {
  roomId: string,
  content: string,    // Max 300 characters
  tempId?: string,    // Optional client-generated ID for optimistic-UI deduplication
});
```

**Server behavior:**
- Validates: `content` is non-empty and `content.length <= 300`
- Validates: sender is a participant in `roomId`
- Inserts message into DB
- Broadcasts `messageReceived` (including `tempId`) to all sockets in room channel

---

### Server → Client (Emitted by server)

---

#### `roomFound`

Fires when matchmaking succeeds. Sent to exactly 5 sockets.

```ts
socket.on("roomFound", (data: {
  roomId: string,
  language: string,      // Shared language code
  prompt: string,        // Conversation prompt text
  expiresAt: string,     // ISO datetime string
  participants: Array<{
    username: string,    // Each participant's real username
    verified: boolean,   // Whether the participant has a verified badge
  }>,
}) => {
  // Redirect to /room/[roomId]
});
```

---

#### `messageReceived`

Fires for every new message. Sent to all sockets in the room channel.

```ts
socket.on("messageReceived", (data: {
  messageId: string,
  username: string,    // Sender's real username
  content: string,
  createdAt: string,   // ISO datetime string
  verified: boolean,   // Whether sender has a verified badge
}) => {
  // Append to chat
});
```

---

#### `roomEnded`

Fires when the 15-minute timer reaches zero. Sent to all sockets in the room channel.

```ts
socket.on("roomEnded", () => {
  // Clear room state
  // Redirect to /lobby
});
```

**Server actions before emitting:**
1. `DELETE FROM rooms WHERE id = roomId` (cascade deletes messages + participants)
2. INSERT into analytics
3. Clear room timer interval
4. Emit `roomEnded` to room channel
5. Server-side: `io.in(roomId).socketsLeave(roomId)`

---

## Error Events

#### `error` (built-in)

```ts
socket.on("error", (err: Error) => {
  // Log / show toast
});
```

Custom application errors are emitted back to the sender only:

```ts
socket.emit("appError", {
  code: "ROOM_NOT_FOUND" | "NOT_PARTICIPANT" | "INVALID_MESSAGE" | "MESSAGE_TOO_LONG" | "ROOM_EXPIRED" | "RATE_LIMITED" | "INVALID_LANGUAGES" | "MATCH_FAILED",
  message: string,
});
```

---

## Room Channel Naming

Socket.IO rooms are named by `roomId`:

```ts
socket.join(roomId);          // Server: join room channel
io.to(roomId).emit(...)       // Server: broadcast to room
socket.to(roomId).emit(...)   // Server: broadcast except sender
```

---

## Disconnect Handling

```ts
socket.on("disconnect", (reason) => {
  // Server:
  // 1. Remove from queue if present
  // 2. Do NOT end the room - others continue
  // 3. Log disconnect (optional)
});

socket.on("reconnect", () => {
  // Client:
  // 1. Re-emit joinRoom if user was in a room
  // 2. Re-fetch room state from GET /api/room/:id
  // 3. Recalculate timer from expiresAt
});
```

---

## TypeScript Interface (types/socket.ts)

```ts
// Client → Server
interface ClientToServerEvents {
  joinQueue: (data: { languages: string[] }) => void;  // userId resolved server-side from session
  leaveQueue: () => void;
  joinRoom: (data: { roomId: string }) => void;
  sendMessage: (data: { roomId: string; content: string; tempId?: string }) => void;
}

// Server → Client
interface ServerToClientEvents {
  roomFound: (data: {
    roomId: string;
    language: string;
    prompt: string;
    expiresAt: string;
    participants: { username: string; verified: boolean }[];
  }) => void;
  messageReceived: (data: {
    messageId: string;
    username: string;
    content: string;
    createdAt: string;
    tempId?: string;  // Echoed back for optimistic-UI deduplication
    verified: boolean;
  }) => void;
  roomEnded: () => void;
  appError: (data: { code: string; message: string }) => void;
}
```