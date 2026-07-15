# Project Map — Digital Campfire

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

## app/ — Pages & Routing

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
│   └── page.tsx                # /lobby — requires auth
│
├── room/
│   └── [id]/
│       └── page.tsx            # /room/[id] — requires auth + participant
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

## components/ — UI Components

```
components/
├── ui/                         # shadcn/ui primitives (auto-generated)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
│
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
│
├── lobby/
│   ├── LobbyView.tsx           # Main lobby layout
│   ├── JoinButton.tsx          # "Join Campfire" CTA
│   ├── LanguageTags.tsx        # Display user's languages
│   └── QueueStatus.tsx         # Current waiters + estimated time
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

## lib/ — Shared Utilities

```
lib/
├── auth.ts                     # Better Auth config & helpers
├── prisma.ts                   # Prisma client singleton
├── socket-client.ts            # Socket.IO client instance (singleton)
├── socket-server.ts            # Socket.IO server setup
├── matchmaking.ts              # Queue logic (language overlap algorithm)
└── utils.ts                    # General helpers (cn, formatTime, etc.)
```

---

## server/ — Socket.IO Logic

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

## prisma/ — Database

```
prisma/
├── schema.prisma               # All models (User, Room, etc.)
└── migrations/                 # Auto-generated migration files
    └── ...
```

---

## hooks/ — React Custom Hooks

```
hooks/
├── useSocket.ts                # Connect/disconnect socket, expose emit
├── useRoom.ts                  # Room state: messages, participants, timer
├── useCountdown.ts             # Client-side countdown from expiresAt
└── useMatchmaking.ts           # Queue state, roomFound listener
```

---

## types/ — TypeScript Types

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
BETTER_AUTH_SECRET=             # Random secret for session signing
BETTER_AUTH_URL=                # App base URL
NEXT_PUBLIC_SOCKET_URL=         # Socket.IO server URL
ADMIN_EMAIL=                    # (optional) Email to set verified=true via db:seed
```

---

## Key File Relationships

```
server.ts (entry)
    └── uses lib/socket-server.ts
            └── uses server/index.ts
                    ├── server/queue.ts       (matchmaking state)
                    └── server/rooms.ts       (room timers)
                            └── lib/prisma.ts (DB writes)

app/room/[id]/page.tsx
    └── uses hooks/useRoom.ts
            ├── uses hooks/useSocket.ts       (lib/socket-client.ts)
            └── uses GET /api/room/:id

components/room/ChatArea.tsx
    └── uses hooks/useRoom.ts → messages state
components/room/CountdownTimer.tsx
    └── uses hooks/useCountdown.ts → derived from expiresAt
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