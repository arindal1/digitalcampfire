# Architecture - Digital Campfire

## System Overview

Digital Campfire is a **Next.js 15 monorepo** that handles both frontend rendering and backend logic. A separate **Socket.IO server** (custom Node.js server) manages all real-time communication.

---

## High-Level Architecture

```
Browser (Client)
    │
    ├── HTTP/HTTPS ──────────► Next.js App Router (Vercel)
    │                               │
    │                               ├── Route Handlers (/api/*)
    │                               ├── Server Actions
    │                               └── Prisma ORM ──► Neon PostgreSQL
    │
    └── WebSocket ───────────► Socket.IO Server (custom server.ts)
                                    │
                                    └── In-memory state (queue, rooms)
```

---

## Layer Responsibilities

### Frontend (Next.js App Router)
- All UI lives under `app/`
- Pages: `/`, `/login`, `/register`, `/lobby`, `/room/[id]`
- Client components handle socket connections and real-time state
- Server components handle initial data fetching

### Backend (Route Handlers + Server Actions)
- Auth: register / login via Better Auth
- Queue management: join/leave matchmaking
- Room data: fetch room info
- Prompt: random selection from DB

### Real-time Layer (Socket.IO)
- Runs as a custom Node.js HTTP server wrapping Next.js
- Manages matchmaking queue in memory
- Broadcasts room events: messages, timer ticks, room end
- Handles reconnections gracefully

### Database (Neon PostgreSQL via Prisma)
- Stores: Users (with `age`, `gender`, `verified`), Rooms, RoomParticipants, Messages, Prompts
- `age` and `gender` are stored for safety; never returned to other users
- `verified` flag defaults to `false`; when `true`, a blue tick appears beside the username in chat; set via `db:seed` with `ADMIN_EMAIL`
- Ephemeral cleanup: rooms + messages deleted after expiry
- Only analytics record persists post-expiry

---

## Deployment

| Layer       | Service         |
|-------------|-----------------|
| Frontend    | Vercel          |
| Backend     | Vercel (same)   |
| Database    | Neon PostgreSQL |
| Socket.IO   | Vercel (custom server) OR separate Node host |

> **Note:** Socket.IO requires a persistent connection. On Vercel, use the custom server approach or a separate lightweight Node.js host (Railway, Fly.io free tier).

---

## Authentication

- Library: **Better Auth**
- Methods: Email + Password only (no OAuth in MVP)
- Session stored in cookies
- Password hashed server-side (never exposed)
- **Age gate:** users must be 18 or older to register (enforced client-side at form submission)
- **Gender:** collected at registration (`male` / `female` / `other`); stored only, never shown to other users

---

## Matchmaking Architecture

The matchmaking queue lives **in memory on the Socket.IO server**.

```
User joins queue
      │
      ▼
Server scans queue for users sharing ≥1 language with this user
      │
      ├── < 5 compatible users found → wait
      │
      └── 5 compatible users found
              │
              ▼
        Select language with highest overlap
              │
              ▼
        Create Room record in DB
              │
              ▼
        Emit roomFound to all 5 sockets
              │
              ▼
        Start 15-minute countdown
```

---

## Room Lifecycle

```
Room Created (DB record written)
      │
      ▼
Users redirected to /room/[id]
      │
      ▼
Socket.IO: users join room channel
      │
      ▼
Timer running (15 min) - client counts down from expiresAt; server fires roomEnded at expiry
      │
      ▼
Messages flow: sendMessage → messageReceived broadcast
      │
      ▼
Timer hits 0 → roomEnded event
      │
      ├── DB: Delete messages
      ├── DB: Delete RoomParticipants
      ├── DB: Delete Room
      ├── DB: Write analytics record (Room #{n} - 5 travellers - [prompt] - Closed)
      └── Users redirected to /lobby
```

---

## Key Constraints

- Max 5 users per room (hard limit)
- Messages: text only, max 300 characters
- Room duration: exactly 15 minutes
- No persistent chat history after room ends
- Users matched only on shared language
- Participants are identified in room by their chosen username