# Digital Campfire

A real-time group chat application that anonymously connects five strangers who share a common language for a 15-minute conversation around a shared prompt. When the timer ends, the room and all its messages are permanently deleted.

---

## Features

- **Language-based matchmaking** — users are matched with others who share at least one language
- **Ephemeral rooms** — all messages and room data are deleted after the 15-minute session ends
- **Shared prompts** — each room receives a random conversation starter
- **Real-time chat** — powered by Socket.IO with optimistic UI updates
- **Verified badge** — admin accounts display a blue ✓ badge in chat
- **Age gate** — registration requires users to be 18 or older

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Real-time | Socket.IO v4 |
| Auth | Better Auth |
| ORM | Prisma v7 |
| Database | PostgreSQL (Neon) |
| Runtime | Node.js 20+ |

---

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- A **PostgreSQL** database — [Neon](https://neon.tech) free tier works well

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url> digital-campfire
cd digital-campfire
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random 32-byte secret for session signing |
| `BETTER_AUTH_URL` | Full app URL, no trailing slash (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Same as above (client-side) |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL (same as app URL in development) |

**Generate `BETTER_AUTH_SECRET`:**

```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Set up the database

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed conversation prompts
```

### 4. Run the development server

```bash
npm run dev
```

> **Important:** Always use `npm run dev`, not `next dev`. The custom server (`server.ts`) wraps Next.js and attaches Socket.IO — skipping it means real-time features will not work.

Open [http://localhost:3000](http://localhost:3000).

---

## Testing Matchmaking Locally

Matchmaking requires **5 users sharing at least one language** to be in the queue simultaneously.

1. Register 5 accounts across 5 browser tabs (use incognito windows as needed)
2. Give each account at least one language in common
3. Click **Join Campfire** on all 5 — they will be matched and redirected to a shared room

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server (Next.js + Socket.IO) |
| `npm run build` | Compile Next.js for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:migrate` | Run versioned migrations (recommended for production) |
| `npm run db:seed` | Seed prompts and optionally grant a verified badge |

---

## Verified Badge

To grant yourself a verified ✓ badge, register your account first, then re-run the seed with your email:

```bash
# macOS / Linux
ADMIN_EMAIL=you@example.com npm run db:seed

# Windows PowerShell
$env:ADMIN_EMAIL="you@example.com"; npm run db:seed
```

---

## Architecture Overview

```
Browser
  ├── HTTP  ──► Next.js App Router  ──► Prisma  ──► PostgreSQL
  └── WS    ──► Socket.IO Server (custom server.ts)
                    ├── In-memory queue (matchmaking)
                    └── Room channels (messages, timer, cleanup)
```

For full details see the [docs/](docs/) folder:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design and layer responsibilities
- [docs/DATA_FLOW.md](docs/DATA_FLOW.md) — complete request/event flows
- [docs/DATABASE.md](docs/DATABASE.md) — schema and data lifecycle
- [docs/SETUP.md](docs/SETUP.md) — detailed setup and deployment guide
- [docs/SOCKETS.md](docs/SOCKETS.md) — Socket.IO event reference
- [docs/API.md](docs/API.md) — REST API reference

---

## Deployment

Socket.IO requires a **persistent Node.js process**, so standard serverless platforms (Vercel functions) are not suitable for the Socket.IO layer. Recommended options:

- **Railway** — deploy the repo directly; set all environment variables in the dashboard
- **Fly.io** — free tier supports persistent processes
- **Any VPS** — run `npm run build && npm run start`
