# Database Schema - Digital Campfire

ORM: **Prisma**
Database: **Neon PostgreSQL**

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Custom fields
  username  String  @unique
  languages String  // JSON-encoded array e.g. '["en","hi"]'
  age       Int
  gender    String  // "male" | "female" | "other"
  verified  Boolean @default(false)

  // Better Auth tables
  sessions     Session[]
  accounts     Account[]

  // App relations
  participants RoomParticipant[]
  messages     Message[]

  @@map("user")
}

model Room {
  id        String   @id @default(cuid())
  language  String   // ISO 639-1 code - shared language for this room
  prompt    String   // Conversation prompt text (copied at room creation)
  startedAt DateTime @default(now())
  expiresAt DateTime // startedAt + 15 minutes

  // Relations
  participants RoomParticipant[]
  messages     Message[]

  @@map("rooms")
}

model RoomParticipant {
  roomId   String
  userId   String
  username String // Participant's real username (copied from User.username at room creation)

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@id([roomId, userId])
  @@map("room_participants")
}

model Message {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  content   String   @db.VarChar(300) // Hard limit: 300 characters
  createdAt DateTime @default(now())

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@map("messages")
}

model Prompt {
  id      String @id @default(cuid())
  content String

  @@map("prompts")
}

model Analytics {
  id           String   @id @default(cuid())
  roomNumber   Int      @default(autoincrement())
  participantCount Int  @default(5)
  prompt       String   // Snapshot of the prompt used
  closedAt     DateTime @default(now())
  status       String   @default("Closed")

  @@map("analytics")
}
```

---

## Table Descriptions

### `user`
Permanent. Stores all registered accounts.

| Column       | Type     | Notes                                                                 |
|--------------|----------|-----------------------------------------------------------------------|
| id           | String   | CUID primary key                                                      |
| name         | String   | Display name (set to username at registration)                        |
| email        | String   | Unique, used for login                                                |
| emailVerified| Boolean  | Better Auth managed                                                   |
| image        | String?  | Optional avatar URL                                                   |
| username     | String   | Unique, displayed in room                                             |
| languages    | String   | JSON-encoded ISO 639-1 array e.g. `["en","hi"]`                      |
| age          | Int      | User-provided age; must be ≥ 18 (enforced at registration)            |
| gender       | String   | `"male"` \| `"female"` \| `"other"` - **never shown to other users** |
| verified     | Boolean  | `false` by default; `true` shows a blue tick beside username in chat  |
| createdAt    | DateTime | Registration timestamp                                                |
| updatedAt    | DateTime | Last update timestamp                                                 |

---

### `rooms`
Ephemeral. Deleted after timer expires.

| Column    | Type     | Notes                                          |
|-----------|----------|------------------------------------------------|
| id        | String   | CUID primary key                               |
| language  | String   | Shared language selected by matchmaking        |
| prompt    | String   | Copied from Prompt table at creation           |
| startedAt | DateTime | Room creation time                             |
| expiresAt | DateTime | startedAt + 900 seconds (15 min)               |

---

### `room_participants`
Ephemeral. Composite PK: (roomId, userId). Deleted with room.

| Column   | Type   | Notes                                       |
|----------|--------|---------------------------------------------|
| roomId   | String | FK → rooms.id (cascade delete)              |
| userId   | String | FK → users.id                               |
| username | String | Participant's real username (copied from User.username at room creation) |

---

### `messages`
Ephemeral. Deleted with room via cascade.

| Column    | Type     | Notes                             |
|-----------|----------|-----------------------------------|
| id        | String   | CUID primary key                  |
| roomId    | String   | FK → rooms.id (cascade delete)    |
| userId    | String   | FK → users.id                     |
| content   | String   | Max 300 chars (enforced by schema + server) |
| createdAt | DateTime | Message timestamp                 |

---

### `prompts`
Permanent. Pre-seeded conversation starters.

| Column  | Type   | Notes            |
|---------|--------|------------------|
| id      | String | CUID primary key |
| content | String | Prompt text      |

Seed data:
```
What made you smile today?
If you could master one skill instantly, what would it be?
What is a place everyone should visit once?
What hobby surprised you the most?
What movie would you erase from your memory just to watch again?
```

---

### `analytics`
Permanent. Written when a room expires.

| Column           | Type     | Notes                              |
|------------------|----------|------------------------------------|
| id               | String   | CUID primary key                   |
| roomNumber       | Int      | Auto-increment room counter        |
| participantCount | Int      | Always 5 in MVP                    |
| prompt           | String   | Snapshot of the prompt used        |
| closedAt         | DateTime | When the room expired              |
| status           | String   | Always "Closed" in MVP             |

Format: `Room #231 - 5 travellers - [prompt] - Closed`

---

## Deletion Strategy

When a room timer reaches zero, the server runs:

```sql
-- Cascade deletes handle messages and room_participants automatically
DELETE FROM rooms WHERE id = $roomId;
```

Prisma equivalent:
```ts
await prisma.room.delete({ where: { id: roomId } });
```

`onDelete: Cascade` on `Message.room` and `RoomParticipant.room` handles child cleanup automatically.

---

## Indexes to Add

```prisma
// On rooms - for expiry cleanup job
@@index([expiresAt])

// On messages - for room message fetch
@@index([roomId, createdAt])

// On room_participants - for participant lookup
@@index([roomId])
```

---

## Language Codes Reference

Languages are stored as ISO 639-1 two-letter codes.

Examples:

| Language   | Code |
|------------|------|
| English    | en   |
| Spanish    | es   |
| French     | fr   |
| Hindi      | hi   |
| Portuguese | pt   |
| Arabic     | ar   |
| Mandarin   | zh   |
| Japanese   | ja   |

Users can select multiple languages at registration. The matchmaking server finds the language with the highest overlap among 5 compatible users.