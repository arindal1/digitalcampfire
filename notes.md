## Digital Campfire — Feature Ideas & Future Roadmap

---

### Viral / Growth Hooks

- **"Campfire Code"** — after a session ends, generate a shareable card with the prompt, a heatmap of how active the conversation was, and the languages spoken. No names, just vibes. Perfect for Twitter/LinkedIn.
- **Streak system** — show users how many consecutive days they've lit a campfire. Simple, sticky, addictive.
- **Room themes** — seasonal or themed campfires (e.g. "Late Night", "Book Club", "Dev Talk"). Rotates weekly. Creates a reason to come back.
- **"Someone's waiting for you"** push notification / email nudge — if a user hasn't joined in a while and the queue has high activity.
- **Post-room reaction** — after the room ends, each user gets a one-tap reaction to the session: 🔥 / ✨ / 😐. Aggregate score shown to no one, but feeds an algorithm that surfaces better prompts over time.

---

### Core UX Improvements

- **Typing indicators** — `username is typing...` in the room. Classic, expected, delightful.
- **Reactions to messages** — single emoji reactions (no reply threads — keep it ephemeral).
- **Sound effects** — subtle crackling fire ambience, a soft "whoosh" when someone joins, a fade-out sound when the room ends. Optional toggle.
- **Room entry animation** — users "walk up to the fire" one by one as they join. Visual cue that the group is forming.
- **Countdown urgency** — timer changes color at 5 min (amber) and 1 min (red). Room dims slightly in the last 60 seconds.
- **Prompt voting** — at the start of a session, show 2 prompts and let the room vote. Winner gets used. Adds social buy-in from second zero.

---

### New Room Modes

- **Solo mode** — write a thought into the void. No match needed. It disappears in 15 minutes anyway. Journaling but chaotic.
- **2-person mode** — just two strangers, more intimate. Different UX (feels like a conversation, not a campfire).
- **Topic rooms** — pre-tagged rooms by topic (tech, music, travel). Still ephemeral. Users opt into a topic instead of pure random.
- **Timed writing sprint** — all 5 users write independently on the same prompt for 5 minutes, then share. No chat during writing.

---

### Matchmaking Improvements

- **Queue position indicator** — "You're 3rd in line for English" gives users confidence to wait.
- **Priority queue** — users who've waited longest get bumped up. Fair and reduces abandonment.
- **Cross-language rooms** — opt-in experimental mode: 5 people, mixed languages, everyone writes in their own language. Chaotic but interesting.
- **Interest tags** — 3 optional tags (music, tech, travel, etc.) at queue join. Soft preference signal, not a hard filter.
- **Smart prompt selection** — track which prompts led to high-message-count rooms (good prompts generate conversation). Weight the random selection toward them.

---

### Social / Retention Layer

- **User "campfire count"** — just a number on the lobby. How many fires have you sat at? No leaderboard, just personal.
- **Favorites prompt** — after a session, users can heart the prompt. Saved privately. No social graph.
- **Anonymous "see you around"** — at room end, before redirect, a screen that says "5 strangers shared this fire. You'll never know who they were." — It's a vibe.
- **Weekly digest email** — "You joined 3 campfires this week. Here are the prompts that sparked the most conversation globally." Community without identity.

---

### Technical / Scalability

- **Redis-backed queue** — replace the in-memory queue with Redis. Survives server restarts, enables horizontal scaling across multiple Socket.IO instances.
- **Socket.IO with Redis adapter** — required for multi-instance deployments. Sticky sessions or pub/sub across nodes.
- **Rate limiting** — per-user message rate limiting (e.g. max 1 message/sec) to prevent flooding. Implement at the Socket.IO middleware layer.
- **Message queue (BullMQ / Redis)** — decouple DB writes from the socket event path. Message confirmed to user instantly, written async.
- **Room cleanup worker** — instead of the server deleting rooms on a timer, a separate background worker scans for expired rooms every minute. More reliable.
- **Edge caching for prompts** — `GET /api/prompts/random` hits the DB every time. Cache the prompt list at the edge, pick random client-side or in a lightweight function.
- **Observability** — structured logging (Pino), room lifecycle events to a log drain, queue depth as a metric. You currently have zero visibility into production behavior.
- **Health check endpoint** — `GET /api/health` returning queue depth, active room count, DB latency. Ops basics.

---

### Moderation & Safety

- **Keyword filter** — basic profanity/slur filter on message content before DB write. Not perfect, but it's the baseline.
- **Report button** — in-room "flag this session" button. Writes a report record with roomId + reporter userId. No names exposed.
- **Auto-ban on repeated reports** — if a userId appears in N reports within X days, auto-suspend and queue for review.
- **Age-gated prompt sets** — some prompts are fine for all ages, some aren't. Tag prompts by maturity level. Only serve age-appropriate ones based on the room's user ages.

---

### Monetization (if ever)

- **Campfire Pro** — custom username badge color, pick your queue priority language, see your campfire history summary (not messages, just prompt + date). $2/month.
- **Gifted fires** — buy a friend a "fire token" that lets them skip the queue once. Silly, fun, shareable.
- **Branded campfires** — a company sponsors a weekly themed prompt. "This week's fire is brought to you by..." — niche but real.

---

### The One Feature That Could Make It Viral

**"Campfire Replay" — not the messages, but the shape of the conversation.** After a room ends, generate an abstract visualization: a waveform or a "fire graph" showing message frequency over 15 minutes. Which minute was the most active? Did it die down or end strong? No text, no names. Just the shape of a conversation between strangers. Shareable as a PNG. People *will* post it.