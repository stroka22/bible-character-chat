# FaithTalkAI – Bible Character Chat: Comprehensive Handoff

---

## TL;DR (Read Me First)
FaithTalkAI lets people chat with Biblically grounded AI characters (Jesus, Paul, Moses, etc.) for study, discipleship, and sermon prep. Frontend is React + Vite; data lives in Supabase; deployment on Vercel; payments via Stripe.  
Current status: product is live on Vercel, all core features work, **but** the character-info popup still appears off-screen on some devices/positions and needs a final fix. Mobile list view has been removed; popup now anchors to the click point yet still fails for edge cases.

Important links (ask project owner for credentials):
- GitHub repo: <https://github.com/stroka22/bible-character-chat>
- Vercel dashboard: *FaithTalkAI / bible-character-chat* (owner account)
- Supabase project: *FaithTalkAI* (credentials required)
- Stripe dashboard: *FaithTalkAI* (credentials required)

Immediate next-action checklist
1. `git clone https://github.com/stroka22/bible-character-chat && cd bible-character-chat`
2. `npm install` – Node 18+ recommended  
3. Create `.env.local` with Supabase + Stripe keys (see Environment section).  
4. `npm run dev` — verify app starts.  
5. Reproduce the popup bug on mobile/desktop; inspect `src/components/CharacterCard.jsx`.  
6. Create a branch, fix, push → Vercel auto-deploys.

---

## Vision & Product Overview
**Purpose**  
Enable engaging, Biblically accurate AI conversations with Bible characters and provide pastors tools for discipleship, study aids, and sermon creation.

**Primary user groups**  
- **General users** – chat, study, favorites.  
- **Admins / Pastors** – manage characters, access advanced tools, future sermon generator.

**Key features delivered**  
- Character selection grid with rich filters & pagination  
- Real-time chat UI (single character)  
- Favorites & featured character support  
- Admin CRUD for characters (CSV import, edit, delete)  
- Pricing / Unlock flow via Stripe

Future feature vision (see Roadmap):
round-table multi-character chats, video/audio sessions, study flows, research tools, multilingual support, sermon-series generator, refined admin ↔ user workflow, aesthetic polish.

---

## System Architecture & Key Technologies
| Layer | Tech / Service | Notes |
|-------|----------------|-------|
| Frontend | **React 18**, Vite, Tailwind utility classes | SPA, React Router |
| State | `ChatContext.jsx` | Selected character & chat state |
| Virtualization | `react-virtuoso` | In deps; grid currently rendered natively |
| Backend | **Supabase** (Postgres + Auth + Storage) | `characterRepository.js` wraps calls |
| Payments | **Stripe** | `stripe.js` dynamically & statically imported |
| Hosting / CI | **Vercel** | Connected to GitHub `main`, auto-deploy |
| Service worker | `public/service-worker-cleanup.js` | Cleans old SWs, UI toast disabled |
| Tooling | Node, npm, ESLint (basic), ErrorBoundary for diagnostics |

---

## Repositories & Code Locations
- **Local path**: `/Users/brian/bible-character-chat`
- **GitHub**: <https://github.com/stroka22/bible-character-chat> (main)

Review these files first:

| Area | File |
|------|------|
| Character UI | `src/components/CharacterCard.jsx` |
| Selection page | `src/components/ScalableCharacterSelection.jsx` |
| Chat experience | `src/components/chat/ChatInterface.js`, `src/components/chat/Chat.jsx` |
| Admin dashboard | `src/pages/AdminPage.js` |
| Data access | `src/repositories/characterRepository.js`, `src/repositories/groupRepository.js` |
| Routing / pages | `src/ConversationsPage.jsx`, `src/pages/FavoritesPage.jsx` |
| Error handling | `src/App.js` (ErrorBoundary) |
| Deployment | `vercel.json` |

Deprecated / backup:
- `CharacterCard.js.backup`, `CharacterCard.tsx.backup`
- `src/components/CharacterSelection.js` (no-op wrapper)

---

## Environment & Configuration
Prerequisites  
```
Node 18+
npm 9+
```

Standard commands  
```
npm install        # install deps
npm run dev        # local dev (Vite)
npm run build      # production build
```

`.env.local` (example – **do not commit**)
```
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxx
```
Add any other Vite-prefixed vars here; Vercel project has the same keys in its dashboard.

`vercel.json` handles SPA rewrites (`/*` → `/index.html`) and cache headers.

---

## Data Model (Supabase)
### Table: `characters`
| Field | Type | Notes |
|-------|------|-------|
| id | UUID/int | PK |
| name | text | |
| description | text | long description |
| bible_book | text | comma-sep list |
| scriptural_context | text | |
| avatar_url | text | optional |
| created_at / updated_at | timestamptz | |
*Removed field*: `short_biography` (must not be referenced).

### Other entities
- `groups` table consumed by `groupRepository.getAllGroups()` – simple `id`, `name`.

---

## Features Implemented

### Character Selection
- Grid + (desktop-only) list view; mobile forces grid.
- Alphabet nav, search, testament/book/group filters, pagination (20/item page).
- LocalStorage-based favorites & featured character.
- Featured character resolved via URL `?featured=` param then localStorage.

### Character Card & Info Modal
- Compact 280 px card; buttons: favorite ⭐︎, featured 📑, info ℹ️, chat 💬.
- Info popup:
  - Anchors to click (button center) ➜ clamps into VisualViewport ➜ fallback center.
  - Listens to resize/scroll on window, scrollable ancestors, VisualViewport; ResizeObserver; requestAnimationFrame.
  - Dark theme, 300 px max width, 60 vh max height.

### Chat
- ChatInterface component with message list, input, mobile back button.
- Conversations & Favorites pages reuse `CharacterCard` grid.

### Admin
- `/admin` page: full CRUD, CSV import (columns must match table), search & filters.
- Update logic fixed (`updateCharacter`) – writes every field.

### UX / Performance
- Responsive header with hamburger.
- Indigo ↔ yellow color palette, improved contrast.
- Tooltips via CSS `data-tooltip`.
- Memoized SVGs, debounced handlers, pointer-events none on paths.
- framer-motion removed (previous crash).
- ErrorBoundary logs detailed stack traces.

### Payments
- `/pricing` route; Stripe pricing table (requires publishable key).
- Pricing button fixed to use `navigate('/pricing')`.

---

## Known Issues & Current Status

| Issue | Status | Hints |
|-------|--------|-------|
| **Info popup still off-screen** on some devices | Reproducible on certain mobile browsers / nested scroll contexts | Inspect `measureAndPosition` in `CharacterCard.jsx`; verify VisualViewport offsets & CSS transforms |
| Mobile list view removed | intentional | nothing to fix |

Debug checklist
1. Open DevTools → log `modalPos`, `vv.*`, `lastClickPos`.
2. Check for `transform` on parent containers.
3. Confirm VisualViewport offset behaviour on iOS (scroll bars collapsed).
4. Temporarily force `position:fixed; left:50vw` to verify stacking context.

---

## Build & Deploy
- CI: push to `main` ➜ Vercel build & deploy (Vite).  
- Build warnings: dynamic Stripe import (safe), big chunk size (>500 kB).  
- Common past build errors fixed (exotic Tailwind classes, malformed SVG).

---

## Developer Runbook

```bash
# 1. Clone & install
git clone https://github.com/stroka22/bible-character-chat
cd bible-character-chat
npm install

# 2. Configure env
cp .env.local.example .env.local   # create & fill keys

# 3. Dev server
npm run dev    # http://localhost:5173

# 4. Lint / build
npm run build
```

Manual QA
- Character grid → filters → popup positions (top/middle/bottom rows, scroll nested container).
- Chat flow (select, send message).
- Admin: edit character, save, hard-refresh list.
- Pricing page loads Stripe components.
- Mobile Safari/Chrome sanity (no list view, popup stays on-screen).

---

## Future Roadmap

1. **Round-table chats** – multiple AI characters & user in same thread.  
2. **Video / Audio avatars** – WebRTC, TTS/STT, animated models.  
3. **Bible study flows** – guided lessons, checkpoints, progress tracking.  
4. **Deep research tools** – commentaries, cross-refs, timelines, citations.  
5. **Multilingual** – UI i18n + prompt localization, model routing.  
6. **Sermon series generator** – outlines, slides, printable resources.  
7. **Enhanced admin workflows** – roles/permissions, audit, bulk ops.  
8. **Aesthetic polish** – spacing, typography scale, animations.  
9. **Re-enable virtualization** for huge lists once popup stable.

---

## Open Questions & Credentials Needed
- Supabase URL & anon/service keys  
- Stripe publishable & secret keys  
- Vercel project access  
- Confirm any additional tables (groups, conversations) & schema export.

---

## Handoff Checklist
- [ ] Obtain all credentials (Supabase, Stripe, Vercel).  
- [ ] Pull `main`, install deps, set up `.env.local`.  
- [ ] Reproduce popup overflow; instrument `CharacterCard.jsx`.  
- [ ] Decide on portal vs. fixed strategy; implement & deploy.  
- [ ] Smoke-test admin CRUD, pricing flow, chat.  
- [ ] Plan next sprint (popup, UI polish, roadmap spikes).

---

### Final Note
If anything is unclear, **start by reading `src/components/CharacterCard.jsx` and `src/components/ScalableCharacterSelection.jsx`**—they contain the latest UI logic, state management, and performance optimizations and are the best entry point to understand the current constraints.

Good luck, and may your code be blessed!
