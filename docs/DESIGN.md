# Design System - Digital Campfire

Visual language: **Apple minimalism × Nothing monochrome × warm campfire atmosphere**

Calm. Premium. Uncluttered.

---

## Color Palette

| Token              | Hex       | Usage                                    |
|--------------------|-----------|------------------------------------------|
| `background`       | `#000000` | Page background                          |
| `surface`          | `#111111` | Cards, panels, primary containers        |
| `surface-secondary`| `#1A1A1A` | Input fields, secondary containers       |
| `text-primary`     | `#FFFFFF` | Headings, body text                      |
| `text-secondary`   | `#8A8A8A` | Subtext, timestamps, placeholders        |
| `accent`           | `#D89B3C` | CTAs, timer, active states (Campfire Amber) |
| `error`            | `#D94B4B` | Error messages, destructive actions      |
| `success`          | `#3FB97D` | Success states, connection confirmed     |

### Tailwind Config

```ts
// tailwind.config.ts
colors: {
  background: "#000000",
  surface: "#111111",
  "surface-secondary": "#1A1A1A",
  "text-primary": "#FFFFFF",
  "text-secondary": "#8A8A8A",
  accent: "#D89B3C",
  error: "#D94B4B",
  success: "#3FB97D",
}
```

---

## Typography

**Fonts:** Geist (primary) + Inter (fallback)

Load via `next/font/google` in `app/layout.tsx`.

```ts
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
```

### Scale

| Role             | Size      | Weight | Color           |
|------------------|-----------|--------|-----------------|
| Page title       | 2xl–3xl   | 600    | text-primary    |
| Section heading  | xl        | 500    | text-primary    |
| Body             | base      | 400    | text-primary    |
| Subtext / meta   | sm        | 400    | text-secondary  |
| Button label     | sm–base   | 500    | text-primary    |
| Timestamp        | xs        | 400    | text-secondary  |

---

## Spacing

Large, generous spacing. Nothing crowded.

- Padding: `p-6`, `p-8` on cards
- Gap between elements: `gap-4`, `gap-6`
- Section separation: `mt-8`, `mt-12`

---

## Borders & Corners

- Border radius: `rounded-xl` (12px) or `rounded-2xl` (16px)
- Borders: minimal - use `border border-white/10` (very subtle) or none
- No heavy dividers

---

## Shadows

Very subtle:

```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
```

Tailwind: `shadow-sm` with dark surfaces (barely visible, use sparingly).

---

## Component Patterns

### Primary Button (Join Campfire CTA)

```
Background: accent (#D89B3C)
Text: #000000 (black for contrast on amber)
Border radius: rounded-xl
Padding: px-6 py-3
Font weight: 500
Hover: slight brightness increase (brightness-110)
Disabled: opacity-50
```

### Secondary Button / Ghost

```
Background: transparent
Border: 1px solid rgba(255,255,255,0.15)
Text: text-primary
Hover: background surface-secondary
```

### Input Fields

```
Background: surface-secondary (#1A1A1A)
Border: 1px solid rgba(255,255,255,0.1)
Border radius: rounded-xl
Text: text-primary
Placeholder: text-secondary
Focus ring: accent color, 1px
Padding: px-4 py-3
```

### Cards / Panels

```
Background: surface (#111111)
Border: 1px solid rgba(255,255,255,0.08)
Border radius: rounded-2xl
Padding: p-6 or p-8
```

### Message Bubbles

**Own messages (right-aligned):**
```
Background: accent (#D89B3C)
Text: #000000
Border radius: rounded-2xl rounded-br-sm
```

**Others' messages (left-aligned):**
```
Background: surface-secondary (#1A1A1A)
Text: text-primary
Border radius: rounded-2xl rounded-bl-sm
```

### Countdown Timer

```
Font: Geist, large (text-4xl or text-5xl)
Color: accent (#D89B3C) normally
Color: error (#D94B4B) when < 60 seconds remaining
Weight: 300 (thin, elegant)
```

---

## Avoid

- Bright colors
- Gradients (anywhere)
- Excessive animations / transitions
- Gamification elements (badges, points, streaks)
- Heavy borders
- Cluttered layouts
- Multiple font sizes competing on one screen

---

## Animation Guidelines

Minimal, purposeful:

- **Fade in** for new messages: `opacity-0 → opacity-100`, duration 150ms
- **Slide up** for page transitions: subtle, 200ms
- **Pulse** for loading states (skeleton screens)
- No bouncing, no spring animations, no confetti

```css
/* New message appear */
transition: opacity 150ms ease-in;

/* Page entry */
transition: transform 200ms ease-out, opacity 200ms ease-out;
```

---

## Loading States

Every async action must show a loading state:

| Action              | Loading UI                              |
|---------------------|-----------------------------------------|
| Login / Register    | Button: spinner + disabled              |
| Join Queue          | Button: "Finding your campfire..." text |
| Waiting in queue    | Animated waiting indicator              |
| Sending message     | Message appears immediately (optimistic) |
| Room loading        | Skeleton of chat area                   |

---

## Responsive Breakpoints

Desktop-first, but fully responsive.

| Breakpoint | Width    | Notes                        |
|------------|----------|------------------------------|
| Mobile     | < 640px  | Full-width, compact chat     |
| Tablet     | 640–1024 | Comfortable layout           |
| Desktop    | > 1024px | Max width container centered |

Max content width: `max-w-2xl` for chat, `max-w-md` for auth forms.

---

## Page-Specific Design Notes

### Landing `/`
- Full-screen dark background
- Large centered headline
- Single CTA button (accent)
- Minimal copy

### Auth `/login`, `/register`
- Centered card on dark background
- `max-w-md`
- Clean form with generous spacing
- No sidebar, no distractions

### Lobby `/lobby`
- Centered layout
- Prominent "Join Campfire" button
- Language tags displayed as small pills
- Subtle queue status below button

### Room `/room/[id]`
- Sticky header: prompt text
- Sticky timer: top-right or centered below header
- Scrollable chat area fills remaining height
- Fixed bottom input bar
- Participant count: small, unobtrusive