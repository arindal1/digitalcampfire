# Project Map - Digital Campfire

Complete file and folder structure for the Next.js 15 monorepo.

---

## Root Structure

```
digital-campfire/
├── app/                        # Next.js App Router
├── components/                 # Shared UI components
├── lib/                        # Shared utilities & config
├── prisma/                     # Database schema & migrations
├── server/                     # Custom Socket.IO server
├── hooks/                      # React custom hooks
├── types/                      # Global TypeScript types
├── public/                     # Static assets
├── docs/                       # Reference documentation (this folder)
├── .env.local                  # Environment variables (never commit)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── server.ts                   # Custom Node.js server entry (Socket.IO)
```

---

## app/ - Pages & Routing

```
app/
├── layout.tsx                  # Root layout (fonts, providers)
├── page.tsx                    # / Landing page
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx            # /login
│   └── register/
│       └── page.tsx            # /register
│
├── lobby/
│   └── page.tsx                # /lobby - requires auth
│
├── room/
│   └── [id]/
│       └── page.tsx            # /room/[id] - requires auth + participant
│
└── api/
    ├── auth/
    │   ├── register/
    │   │   └── route.ts        # POST /api/auth/register
    │   └── login/
    │       └── route.ts        # POST /api/auth/login
    ├── queue/
    │   ├── join/
    │   │   └── route.ts        # POST /api/queue/join
    │   └── leave/
    │       └── route.ts        # POST /api/queue/leave
    ├── room/
    │   └── [id]/
    │       └── route.ts        # GET /api/room/:id
    └── prompts/
        └── random/
            └── route.ts        # GET /api/prompts/random
```

---

## components/ - UI Components

```
components/
├── EmberBackground.tsx         # Animated ember particle background (Server Component)
│
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
│
├── lobby/
│   ├── LobbyView.tsx           # Main lobby layout + "Join Campfire" button
│   ├── LanguageTags.tsx        # Display user's languages
│   └── QueueStatus.tsx         # Animated searching indicator
│
└── room/
    ├── RoomView.tsx            # Main room layout
    ├── PromptBanner.tsx        # Displays conversation prompt
    ├── CountdownTimer.tsx      # 15-min countdown
    ├── ChatArea.tsx            # Scrollable message list
    ├── MessageBubble.tsx       # Individual message
    ├── MessageInput.tsx        # Text input + send button
    └── ParticipantCount.tsx    # "5 people in this room"
```

---

## lib/ - Shared Utilities

```
lib/
├── auth.ts                     # Better Auth server config (hooks, validation)
├── auth-client.ts              # Better Auth browser client (signIn, signOut)
├── prisma.ts                   # Prisma client singleton
└── utils.ts                    # General helpers (cn, formatTime, parseLanguages)
```

---

## server/ - Socket.IO Logic

```
server/
├── index.ts                    # Socket.IO server initialization
├── queue.ts                    # In-memory queue state + matchmaking
├── rooms.ts                    # Room channel management + timer
└── handlers/
    ├── joinQueue.ts            # joinQueue event handler
    ├── leaveQueue.ts           # leaveQueue event handler
    ├── joinRoom.ts             # joinRoom event handler
    └── sendMessage.ts          # sendMessage event handler
```

---

## prisma/ - Database

```
prisma/
├── schema.prisma               # All models (User, Room, etc.)
└── migrations/                 # Auto-generated migration files
    └── ...
```

---

## hooks/ - React Custom Hooks

```
hooks/
├── useSocket.ts                # Connect/disconnect socket, expose emit
├── useRoom.ts                  # Room state: messages, participants, timer
├── useCountdown.ts             # Client-side countdown from expiresAt
└── useMatchmaking.ts           # Queue state, roomFound listener
```

---

## types/ - TypeScript Types

```
types/
├── socket.ts                   # Socket event payload types
├── room.ts                     # Room, Message, Participant types
└── user.ts                     # User session type
```

---

## Environment Variables (.env.local)

```
DATABASE_URL=                   # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=             # Random 32-byte secret for session signing
BETTER_AUTH_URL=                # App base URL (server-side)
NEXT_PUBLIC_APP_URL=            # App base URL (browser-side, same value)
NEXT_PUBLIC_SOCKET_URL=         # Socket.IO server URL (same as app URL in monorepo)
ADMIN_EMAIL=                    # (optional) Email to set verified=true via db:seed
```

---

## Key File Relationships

```
server.ts (entry)
    └── server/index.ts           (initSocketServer — auth middleware + event handlers)
            ├── server/queue.ts   (in-memory matchmaking state)
            └── server/rooms.ts   (room timers + cleanup)
                    └── lib/prisma.ts (DB writes)

app/room/[id]/page.tsx
    └── hooks/useRoom.ts
            ├── hooks/useSocket.ts  (Socket.IO singleton client)
            └── GET /api/room/:id

app/lobby/page.tsx
    └── components/lobby/LobbyView.tsx
            └── hooks/useMatchmaking.ts
                    └── hooks/useSocket.ts

components/room/ChatArea.tsx
    └── hooks/useRoom.ts → messages state
components/room/CountdownTimer.tsx
    └── hooks/useCountdown.ts → derived from expiresAt
```

---

## Pages Summary

| Route          | Auth Required | Component         | Purpose                        |
|----------------|---------------|-------------------|-------------------------------|
| `/`            | No            | Landing page      | Marketing / entry point        |
| `/login`       | No            | LoginForm         | Email + password login         |
| `/register`    | No            | RegisterForm      | Create account + languages     |
| `/lobby`       | Yes           | LobbyView         | Join queue, see wait status    |
| `/room/[id]`   | Yes           | RoomView          | Live chat with 5 participants  |