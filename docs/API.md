# API Routes — Digital Campfire

All HTTP routes are Next.js Route Handlers under `app/api/`.
Real-time messaging is handled via Socket.IO (see SOCKETS.md).

---

## Authentication

All protected routes check for a valid Better Auth session cookie.
If not authenticated → `401 Unauthorized`.

---

## Routes

---

### `POST /api/auth/register`

Create a new user account.

**Auth required:** No

**Request body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "languages": ["en", "hi"]
}
```

**Validation:**
- `username`: 3–20 chars, alphanumeric + underscores, unique
- `email`: valid email format, unique
- `password`: min 8 characters
- `languages`: non-empty array, valid ISO 639-1 codes

**Response 201:**
```json
{
  "user": {
    "id": "clxyz...",
    "username": "johndoe",
    "email": "john@example.com",
    "languages": ["en", "hi"]
  }
}
```
Sets a session cookie.

**Response 400:** Validation error
```json
{ "error": "Username already taken" }
```

---

### `POST /api/auth/login`

Authenticate with email and password.

**Auth required:** No

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "clxyz...",
    "username": "johndoe",
    "languages": ["en", "hi"]
  }
}
```
Sets a session cookie.

**Response 401:**
```json
{ "error": "Invalid email or password" }
```

---

### `POST /api/queue/join`

Register the user's intent to join the matchmaking queue.
The actual queue logic happens via Socket.IO (`joinQueue` event).
This route exists for server-side validation and rate limiting.

**Auth required:** Yes

**Request body:** None (user resolved from session)

**Response 200:**
```json
{ "ok": true }
```

**Response 401:** Not authenticated

---

### `POST /api/queue/leave`

Signal server to remove user from queue.
Also handled by the `leaveQueue` Socket.IO event.

**Auth required:** Yes

**Request body:** None

**Response 200:**
```json
{ "ok": true }
```

---

### `GET /api/room/:id`

Fetch room details. Used on initial load of `/room/[id]`.

**Auth required:** Yes. User must be a participant in the room.

**Response 200:**
```json
{
  "room": {
    "id": "clxyz...",
    "language": "en",
    "prompt": "What made you smile today?",
    "startedAt": "2026-07-15T10:00:00.000Z",
    "expiresAt": "2026-07-15T10:15:00.000Z",
    "participants": [
      { "username": "username1", "verified": false },
      { "username": "username2", "verified": true },
      { "username": "username3", "verified": false },
      { "username": "username4", "verified": false },
      { "username": "username5", "verified": false }
    ],
    "myUsername": "username3"
  }
}
```

**Response 403:** User is not a participant in this room
**Response 404:** Room not found (may have already expired)

---

### `GET /api/prompts/random`

Return a randomly selected prompt from the database.
Called internally by the matchmaking server when creating a room.

**Auth required:** Yes (internal use, called by Socket.IO server)

**Response 200:**
```json
{
  "prompt": {
    "id": "clxyz...",
    "content": "What made you smile today?"
  }
}
```

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "error": "Human-readable error message"
}
```

---

## HTTP Status Codes Used

| Code | Meaning                     |
|------|-----------------------------|
| 200  | OK                          |
| 201  | Created                     |
| 400  | Bad request / validation    |
| 401  | Not authenticated           |
| 403  | Forbidden (not authorized)  |
| 404  | Resource not found          |
| 500  | Internal server error       |

---

## Security Notes

- Passwords are **never** returned in any response
- Session cookies are `httpOnly`, `secure`, `sameSite: lax`
- Room access is gated: only verified participants can fetch room data
- Message content is validated server-side (length ≤ 300) in both REST and Socket.IO
- No user's real `userId` is exposed to other participants — only anonymous aliases