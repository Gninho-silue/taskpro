# TaskPro — Frontend Design Handoff

## Overview
TaskPro is a project & task management web app with a dark developer-aesthetic UI. This document describes every screen, component, token, and interaction so you can implement the frontend in React (the target stack is React 19 + TypeScript + TailwindCSS v4 — see the API guide for full tech stack details).

## About the Design Files
The file `TaskPro.html` in this bundle is a **hi-fidelity interactive prototype** built in plain HTML/React/Babel. It is a design reference — do NOT ship it as production code. Your job is to recreate these designs inside the existing React + TypeScript + Vite + TailwindCSS v4 codebase using its established patterns (Zustand, React Query, React Router DOM v7, Lucide React icons, Framer Motion, etc.).

## Fidelity
**High-fidelity.** Match colors, spacing, typography, border radii, and interactions as closely as possible. The prototype is the source of truth for visual appearance.

---

## Design Tokens

### Colors
```
Background:     #080812   (page bg)
Surface:        #0c0c1d   (sidebar, modals)
Card:           #0f0f20   (cards, inputs)
Border:         #1e1e3a   (default borders)
Border hover:   #2a2a48   (hover state borders)
Border active:  #3b3b5e   (active/focus borders)

Text primary:   #e8e8f0
Text muted:     #6b6b8a
Text dim:       #3b3b5e

Accent purple:  #7c3aed   (primary CTA, active nav)
Purple light:   #a78bfa   (active nav text, headings)
Purple dark:    #4c1d95

Green:          #10b981   (success, completed)
Amber:          #f59e0b   (warning, high priority)
Red:            #ef4444   (urgent, danger)
Cyan:           #06b6d4   (medium priority, info)
```

### Status → Color mapping
```
PLANNING:     #6b6b8a
IN_PROGRESS:  #7c3aed
ON_HOLD:      #f59e0b
COMPLETED:    #10b981
CANCELLED:    #ef4444
```

### Priority → Color mapping
```
LOW:    #6b6b8a
MEDIUM: #06b6d4
HIGH:   #f59e0b
URGENT: #ef4444
```

### Typography
```
Font family:  "JetBrains Mono", monospace  (Google Fonts)
Weights used: 400, 500, 600, 700, 800

Scale:
  10px / 400 — timestamps, secondary meta
  11px / 600-700 — labels, uppercase section headers (letter-spacing: 0.08–0.1em)
  12px / 400-600 — body text, list items, comments
  13px / 500-700 — card titles, nav items, form inputs
  14px / 700-800 — modal titles, button text
  16px / 800 — sidebar logo
  20px / 800 — page titles (letter-spacing: -0.4px)
  24px / 800 — dashboard greeting (letter-spacing: -0.5px)
  34-36px / 800 — stat numbers (letter-spacing: -1px)
```

### Spacing & Radius
```
Card border-radius:    12px (project cards), 10px (list items), 9px (meta boxes)
Modal border-radius:   16px
Button border-radius:  8px
Badge border-radius:   6px
Input border-radius:   8px
Avatar border-radius:  50%

Page padding:    32px horizontal, 20-32px vertical
Card padding:    20-22px
List item pad:   11-14px vertical, 14-18px horizontal
Gap (grid):      12-14px
Gap (list):      7-8px
```

### Shadows / Glow
```
Modal overlay:   rgba(0,0,0,0.65) fullscreen backdrop
Modal shadow:    0 20px 60px rgba(0,0,0,0.6)
Background grid: repeating lines at rgba(255,255,255,0.02), 40px × 40px
Glow blobs on auth: radial gradients, purple 12% opacity + green 8% opacity
```

---

## Global Layout

```
┌──────────────────────────────────────────────┐
│  Sidebar (220px, collapsible to 64px)        │
│  ┌────────────────────────────────────────┐  │
│  │ Logo                                   │  │
│  │ Nav items                              │  │
│  │   ...                                  │  │
│  │ User info + logout + collapse toggle   │  │
│  └────────────────────────────────────────┘  │
│  Main content area (flex: 1, overflow hidden)│
│  ┌────────────────────────────────────────┐  │
│  │ Topbar (title + actions)               │  │
│  │ Scrollable content                     │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

Background: `#080812` with a subtle CSS grid overlay (`background-image` with 40×40px lines at 2% white opacity).

---

## Screens

### 1. Login / Register (`/login`, `/register`)

Full-viewport centered layout. Background: `#080812` + grid + two radial glow blobs (purple top-left, green bottom-right).

**Logo block** (centered, mb-32px):
- 40×40px rounded-10 div, gradient `135deg #7c3aed → #a855f7`, white "T" at 18px/800
- "TaskPro" text 22px/800 beside it
- Subtitle 13px muted below

**Card** (width 420px, background `#0f0f20`, border `#1e1e3a`, radius 16px, padding 32px):
- Register mode adds first/last name row (2-column grid, gap 12px)
- Email field, Password field
- "Forgot password?" link (right-aligned, 11px purple) — login mode only
- Submit button: full width, 12px padding, gradient `135deg #7c3aed → #6d28d9`, 14px/700, radius 8px
- Toggle link below card (12px)

**Input style**: padding 11px 14px, bg `#0c0c1d`, border `#1e1e3a` → `#7c3aed` on focus, radius 8px, 13px text.

---

### 2. Dashboard (`/dashboard`)

**Topbar**: greeting "Good morning, [name] 👋" (20px/800, name in `#a78bfa`), subtitle with date + pending count. Right: Search ghost button + "New Task" primary button.

**Stats row** (4-column grid, gap 12px):
Each card: bg `#0f0f20`, border `#1e1e3a`, radius 12px, padding 22px 24px.
- Large number: 34px/800, accent color
- Label: 12px muted

Stats: Total projects (purple), Active tasks (purple), High priority (amber), Completed (green).

**2-column grid** (gap 20px) below stats:

*My Tasks* (left):
- Section header: 11px/700 uppercase muted + "View all →" link in purple
- List items: bg `#0f0f20`, border `#1e1e3a`, radius 10px, padding 11px 14px
  - Priority dot (7px circle, priority color) + title (12px/500) + due date (10px dim) + status badge
  - Completed tasks: `#3b3b5e` color + `line-through`
  - Hover: border → `#2a2a48`

*Recent Projects* (right):
- Same header pattern
- Cards show: priority dot + name + status badge + progress bar (3px, gradient purple→green) + meta row (10px dim)
- Hover: border → `#2a2a48`

---

### 3. Projects (`/projects`)

**Topbar**: "Projects" title + project/in-progress counts. Right: search input (180px wide, icon inside) + "New Project" button.

**Grid**: 3 columns, gap 14px. Each card:
- bg `#0f0f20`, border `#1e1e3a`, radius 12px, padding 20px 22px
- **Accent line**: 3px top border, gradient from `STATUS_COLOR[status]` to transparent
- Title (13px/700) + status badge in header row
- Description (11px muted, 2-line clamp, line-height 1.6)
- Progress bar (4px, gradient purple→green)
- Meta row: task count + member count (left) + due date (right), 11px dim
- Hover: border → `#2a2a48` + `translateY(-2px)` transform

---

### 4. Kanban Board (`/projects/:id/kanban`)

**Topbar**: Project name + due date subtitle. Right: status badge + Settings ghost button + "Add Task" primary button.

**Board**: horizontal grid of 4 columns (min-width 860px, scrollable), gap 14px, full height.

**Column header** (mb 12px):
- 8px status dot + column label (11px/700 uppercase muted, letter-spacing 0.08em) + count badge (right, 11px/600, bg `#1e1e3a`, radius 6px)

**Task card** (bg `#0f0f20`, border `#1e1e3a`, radius 10px, padding 14px):
- Row 1: 6px priority dot + label chips + priority badge (right, 10px)
- Title: 12px/600 text, line-height 1.5, mb 10px
- Footer: comment count icon + attachment count icon + due date (right) + avatar (right)
- Hover: border → `#2a2a48` + `translateY(-1px)`

**Add task** (bottom of each column): dashed border button, hover → purple border + purple text.

---

### 5. My Tasks (`/tasks`)

**Topbar**: "My Tasks" + assigned count. Right: "New Task" button.

**Filter tabs** below topbar (padding 14px 32px 0): ALL / TODO / IN_PROGRESS / IN_REVIEW / DONE
- Active tab: bg `rgba(124,58,237,0.2)`, color `#a78bfa`
- Inactive: transparent, muted color
- 11px/600, radius 8px, padding 6px 12px

**Task list** (flex column, gap 8px, padding 16px 32px):
Each row: bg `#0f0f20`, border `#1e1e3a`, radius 10px, padding 14px 18px, flex row.
- Priority dot (8px) + title (13px/600) + label chips + due date
- Priority badge + status badge (right side)
- Completed: line-through + dim color

---

### 6. Teams (`/teams`)

3-column grid, gap 14px. Each card:
- 42×42 icon box (radius 10px, gradient purple/green bg at 13% opacity) + team initial
- Name (14px/700) + description (11px muted, line-height 1.6)
- Meta: member count + project count (11px dim)
- Leader row: small avatar + "Led by [name]" (10px muted)
- Hover: border → `#2a2a48` + `translateY(-2px)`

---

### 7. Notifications (`/notifications`)

Max-width 680px list. Each row:
- Unread: border `#2a2a48`, purple dot in top-right corner (6px), text color `#e8e8f0`, font-weight 500
- Read: border `#1e1e3a`, text color `#6b6b8a`, font-weight 400
- Icon box (34×34, radius 9px, tinted bg) + message + timestamp
- Click to mark as read

Type → icon color: COMMENTED=cyan, ASSIGNED=purple, STATUS_CHANGED=amber, DUE_SOON=red, GENERAL=muted.

"Mark all read" ghost button in topbar when unread > 0.

---

### 8. Task Detail Modal

Triggered by clicking any task card. Overlays entire app. `Escape` to close.

**Overlay**: `rgba(0,0,0,0.65)` fullscreen, click outside to dismiss.

**Panel** (max-width 680px, max-height 90vh, scrollable, bg `#0c0c1d`, border `#1e1e3a`, radius 16px):

*Header* (padding 22px 24px 18px, border-bottom):
- Badge row: priority badge + status badge + label chips
- Title: 17px/800, letter-spacing -0.3px
- Close button (top-right ✕)

*Body* (padding 20px 24px):
- Description: 13px muted, line-height 1.7, mb 22px
- Meta grid (3 cols, gap 14px): Assignee / Due Date / Hours — each in a card (bg `#0f0f20`, radius 9px, 12px 14px padding, 10px uppercase label + 12px/600 value)
- Progress bar (6px, gradient, with % label row above), mb 22px
- Comments section header: 11px/700 uppercase muted
- Comment rows: avatar (28px) + card (bg `#0f0f20`, radius 9px) with name/time header + 12px muted body
- Add comment: avatar + textarea card, "Post comment" button appears when input non-empty

---

## Sidebar

Width 220px (collapsed: 64px), transition 0.22s ease. bg `#0c0c1d`, right border `#1e1e3a`.

**Logo row** (padding 18px 14px): 32px icon + "TaskPro" text / collapsed: icon only.

**Nav items**: icon (17px) + label. Active: bg `rgba(124,58,237,0.18)`, color `#a78bfa`. Hover: bg `rgba(255,255,255,0.04)`, color `#a78bfa`.

Notifications item shows unread badge (purple pill, 10px/700) — collapsed: 7px red dot in corner.

**Bottom**: user avatar + name + email / collapsed: hidden. Logout button (hover → red tint). Collapse toggle chevron (rotates 180° when collapsed).

---

## Shared Components

### Btn
- `primary`: bg `#7c3aed`, white text
- `ghost`: transparent, border `#1e1e3a`, muted text
- `danger`: red tint bg/border/text
- `success`: green tint bg/border/text
- Sizes: `sm` (6px 14px, 12px font), `md` (10px 20px, 13px font)
- Radius 8px, font-weight 600

### Badge
- `fontSize: 10`, `fontWeight: 600`, `padding: 2px 8px`, `borderRadius: 6px`
- bg = `${color}22` (22 = ~13% opacity), text = color

### Avatar
- Circular div, gradient bg `135deg #7c3aed → #10b981`
- Initials in white, font proportional to size

### Progress Bar
- Track: `#1e1e3a`, 4–6px height, radius 3px
- Fill: gradient `90deg #7c3aed → #10b981`

---

## Interactions & Animations

| Element | Trigger | Effect |
|---|---|---|
| Sidebar | Click collapse toggle | Width 220→64px, 0.22s ease. Chevron rotates 180°. Labels fade out. |
| Project card | Hover | `translateY(-2px)` + border → `#2a2a48` |
| Kanban card | Hover | `translateY(-1px)` + border → `#2a2a48` |
| Task list row | Hover | border → `#2a2a48` |
| Progress bar | Mount | Animate width from 0 to value, 0.4s |
| Task modal | Open | Fade in overlay; panel slides up slightly (Framer Motion: `y: 20 → 0, opacity: 0→1`) |
| Task modal | Escape / outside click | Close |
| Notifications | Click row | Mark as read (border dims, text dims, dot disappears) |
| Nav item | Click | Instant page switch, no animation needed |
| Input | Focus | Border color → `#7c3aed` |
| Add task button | Hover | Border + text → purple |

---

## Routing

```
/login                     → AuthScreen (login mode)
/register                  → AuthScreen (register mode)
/forgot-password           → ForgotPassword
/reset-password            → ResetPassword
/activate-account          → EmailVerification
/dashboard                 → Dashboard
/projects                  → Projects list
/projects/:id              → Project detail / Kanban
/tasks                     → My Tasks
/teams                     → Teams list
/notifications             → Notifications
```

All routes except auth are protected — redirect to `/login` on 401 or missing token.

---

## API Connection

Base URL: `http://localhost:8081/api/v1`
Auth: `Authorization: Bearer <jwt>` header on every request.
Token stored in Zustand + localStorage. On 401 → logout + redirect to `/login`.

See the full API spec in the pasted text for all endpoints and DTOs.

---

## Files in This Bundle

| File | Purpose |
|---|---|
| `TaskPro.html` | Full hi-fi interactive prototype — open in browser for visual reference |
| `HANDOFF.md` | This document |
