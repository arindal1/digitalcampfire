# Data Flow - Digital Campfire

Complete request/response and event flows for every major feature.

---

## 1. Registration Flow

```
Client: POST /api/auth/register
  Body: { username, email, password, age, gender, languages: ["en", "hi"] }
        │
        ▼
Better Auth handler
  - Validates fields (age ≥ 18, gender in allowed set)
  - Hashes password (bcrypt)
  - Writes User to DB (age + gender stored; never shared with other users)
        │
        ▼
Response: 201 Created + session cookie
        │
        ▼
Client redirects → /lobby
```

---

## 2. Login Flow

```
Client: POST /api/auth/login
  Body: { email, password }
        │
        ▼
Better Auth handler
  - Looks up user by email
  - Compares password hash
        │
        ├── Invalid → 401 Unauthorized
        │
        └── Valid → session cookie set
                    Client redirects → /lobby
```

---

## 3. Lobby Load

```
Client: GET /lobby (Server Component)
        │
        ▼
Server fetches session → gets current User from DB
  - Displays: username, languages
  - Displays: current queue count (optional polling or SSE)
        │
        ▼
Client renders:
  - Welcome message
  - Language tags
  - "Join Campfire" button
  - Estimated wait count
```

---

## 4. Join Queue Flow

```
Client clicks "Join Campfire"
        │
        ▼
Client: POST /api/queue/join
  - Server validates session
  - Returns OK
        │
        ▼
Client: Socket.IO emit → joinQueue
  Payload: { userId, languages: ["en", "hi"] }
        │
        ▼
Server (Socket.IO):
  - Adds user to in-memory queue: { socketId, userId, languages }
  - Scans queue for 5 users sharing ≥1 language
        │
        ├── No match yet → user waits
        │
        └── 5 compatible users found:
              1. SELECT language with highest overlap among 5
              2. SELECT random prompt from DB
              3. INSERT Room { language, promptId, startedAt, expiresAt }
              4. INSERT RoomParticipants × 5 (real username fetched from DB per user)
              5. Remove all 5 from in-memory queue
              6. emit roomFound to all 5 sockets
                 Payload: { roomId, language, prompt, expiresAt, participants }
```

---

## 5. Room Entry Flow

```
Client receives roomFound
        │
        ▼
Client redirects → /room/[roomId]
        │
        ▼
Client: GET /api/room/:id
  - Server verifies user is a RoomParticipant
  - Returns: { roomId, prompt, language, expiresAt, participants }
        │
        ▼
Client: Socket.IO emit → joinRoom
  Payload: { roomId, userId }
        │
        ▼
Server (Socket.IO):
  - socket.join(roomId)
  - Broadcast updated participant count (if needed)
        │
        ▼
Client renders:
  - Prompt (top)
  - Countdown timer (synced to expiresAt)
  - Chat area (empty)
  - Participant count
```

---

## 6. Message Send Flow

```
User types message → presses Enter / Send
        │
        ▼
Client: optimistic UI update (message appears instantly, pending state)
        │
        ▼
Client: Socket.IO emit → sendMessage
  Payload: { roomId, content: "Hello!" }
  (userId resolved server-side from socket session)
        │
        ▼
Server (Socket.IO):
  - Validates: content length ≤ 300 chars
  - Validates: user is participant in roomId
  - INSERT Message { roomId, userId, content, createdAt } into DB
  - emit messageReceived to all in room channel
    Payload: { messageId, username, content, createdAt }
        │
        ▼
Client receives messageReceived:
  - Replaces optimistic message with confirmed message
  - All other clients append new message
```

---

## 7. Timer Sync Flow

```
Room created → Server sets a 1-second interval checking expiry
        │
        │  (Client-side: countdown derived from expiresAt via useCountdown hook)
        │
        │ (when server detects secondsRemaining === 0)
Server:
  1. DELETE Messages WHERE roomId = X
  2. DELETE RoomParticipants WHERE roomId = X
  3. DELETE Room WHERE id = X
  4. INSERT AnalyticsRecord (room#, participant count, prompt, status=Closed)
  5. emit roomEnded to room channel
        │
        ▼
Client receives roomEnded:
  - Clears room state
  - Redirects → /lobby
```

---

## 8. Leave Queue Flow

```
Client: POST /api/queue/leave
  OR
Client: Socket.IO emit → leaveQueue
        │
        ▼
Server (Socket.IO):
  - Removes user from in-memory queue by socketId / userId
        │
        ▼
Client: returns to lobby idle state
```

---

## 9. Disconnect / Reconnect Flow

```
Client socket disconnects (network drop, tab close)
        │
        ▼
Server (Socket.IO):
  - on('disconnect'): remove from queue if present
  - Room continues for remaining participants
        │
        ▼
Client reconnects:
  - Socket.IO auto-reconnects
  - Client re-emits joinRoom { roomId, userId }
  - Server re-adds to room channel
  - Client re-fetches room state from GET /api/room/:id
  - Timer re-syncs from expiresAt (client-calculated, not server ticks)
```

---

## Data Ownership Summary

| Data             | Where it lives          | When deleted                |
|------------------|-------------------------|-----------------------------|
| User account     | PostgreSQL (permanent)  | Never (MVP)                 |
| Session cookie   | Browser + Better Auth   | On logout / expiry          |
| Queue state      | Socket.IO in-memory     | On match or disconnect      |
| Room record      | PostgreSQL (ephemeral)  | After timer expires         |
| Messages         | PostgreSQL (ephemeral)  | After timer expires         |
| RoomParticipants | PostgreSQL (ephemeral)  | After timer expires         |
| Analytics record | PostgreSQL (permanent)  | Never                       |
| Prompts          | PostgreSQL (permanent)  | Never                       |