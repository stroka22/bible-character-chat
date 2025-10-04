# FaithTalkAI – Bible Character Chat

Comprehensive hand‑off for the next Droid to continue work seamlessly. This document consolidates project purpose, architecture, environments, workflows, features, current issues, and next steps, with explicit pointers to source, docs, and operational procedures.

## Quick Index
- Project overview and goals
- Codebase locations and key docs
- Environments, hosting, and infra
- Software stack and how pieces interact
- Data model and migrations
- API surface and proxies
- Features by role (super‑admin, admin, user)
- Current status and known issues
- In‑progress work and top priorities
- End‑to‑end test plans (chat, roundtable, bible studies)
- Operational playbooks (deploy, migrations, clearing caches, debugging)
- Credentials and environment variables
- Future roadmap: video/audio sessions, deep research tools, multi‑language

---

## Project Overview
FaithTalkAI lets users converse with Bible characters, engage in Roundtable group chats, and follow structured Bible Studies. The experience is optimized for both anonymous and authenticated users, on desktop and mobile. Admins can curate characters and set a site‑wide featured character; super‑admins manage users and settings.

Primary objectives:
- High‑quality chat experiences with character‑specific context and study integration.
- Server‑backed persistence for conversations, favorites, and preferences.
- Consistent “featured character” across devices/domains with admin control.
- Resilient operation on devices that block third‑party requests (mobile privacy/CORS).

---

## Codebase and Documents

- Local working directory (current user):
  - /Users/brian/bible-character-chat

- GitHub repository:
  - https://github.com/stroka22/bible-character-chat (main branch)

- Key application sources (src/):
  - Pages: `src/pages/*` (Home, Login/Signup, Studies, My Walk, Admin, etc.)
  - Contexts: `src/contexts/*` (Auth, Chat, Conversation, Roundtable)
  - Repositories: `src/repositories/*` (characters, site settings, user settings, conversations, studies)
  - Components: `src/components/*` (Header, Featured banner, admin panels, chat UIs)
  - Services: `src/services/*` (supabase client, tier settings)

- API routes (serverless on Vercel):
  - `api/featured/site.mjs` – same‑origin proxy for site‑level featured settings
  - `api/user/featured.mjs` – same‑origin proxy to read/write user featured settings (RLS via auth token)

- Supabase migrations:
  - `supabase/migrations/20251003_user_settings_and_favorites.sql`
  - `supabase/migrations/20251003_site_settings_admin_featured.sql`
  - `supabase/migrations/20251004_site_settings_enforce_admin_default.sql` (new; add enforce flag)

- CI for migrations:
  - `.github/workflows/supabase-migrations.yml` – GitHub Actions to apply migrations to Production

- Important docs already in repo (read these):
  - HANDOFF_FINAL.md, PROJECT_HANDOFF.md, NEXT_SESSION_HANDOFF.md
  - TROUBLESHOOTING.md and TROUBLESHOOTING-GUIDE.md
  - PR_SUMMARY.md, IMPLEMENTATION_SUMMARY.md, TESTING_CHAT.md
  - README.md, START_HERE.md, DEPLOYMENT.md, database_schema.md

---

## Environments and Hosting

- Production site: https://faithtalkai.com/
- Preview domains (Vercel): `https://bible-character-chat-*.vercel.app/`
- Hosting: Vercel (SPA + serverless API routes under `/api/*`)
- Database: Supabase project (ref: `sihfbzltlhkerkxozadt`)

Auth/session scope is per domain (prod vs preview do not share sessions). Server‑side migrations target the Production Supabase project via GitHub Actions or manual SQL.

---

## Software Stack and Interactions

- Frontend: React + Vite + Tailwind CSS
- Router: react-router-dom
- State/Context: custom context providers (Auth, Chat, Conversation, Roundtable)
- Backend (BaaS): Supabase (Postgres + Auth + RLS + Storage)
- Hosting/Edge: Vercel (static front‑end + serverless functions in `/api`)
- Payments: Stripe (subscription gating; premium flag)
- LLM: OpenAI (proxied via project code; see envs)

Interaction model:
- SPA loads and initializes contexts (AuthProvider → ConversationProvider → ChatProvider).
- Supabase client performs DB ops; on devices with blocked third‑party requests, same‑origin proxy API endpoints are used (Vercel functions call Supabase with anon key and pass auth headers when required for RLS).
- Featured character resolution priority: URL param → (enforced Admin default → stop) → User preference (logged in) → Org‑scoped localStorage → Legacy localStorage → Fallback (Jesus/first visible).

---

## Data Model and Migrations (Key Tables)

- `site_settings` (owner_slug PK)
  - `default_featured_character_id` (uuid)
  - `enforce_admin_default` (boolean) – NEW flag to force admin default on Home
  - RLS: standard anon readable (verify policies in migration file)

- `user_settings` (user_id PK)
  - `featured_character_id` (uuid) – user’s preferred featured
  - RLS: user can read/write own row (enforced via auth.uid())

- `user_favorites` (user_id, character_id)
  - Server‑backed favorites list

- `characters` (character definitions; visibility flags, images, insights fields)

- Conversations (tables vary by repo design; confirm schema):
  - Conversations and messages tables for normal chat, roundtable, and study contexts

- Bible Studies (confirm in code/schema):
  - Studies, Lessons, Series tables
  - Progress: user/study/lesson progress upserts (with `onConflict`)

Migrations to apply/verify:
- 20251004: adds `enforce_admin_default` boolean to `site_settings`
- Action runner: `.github/workflows/supabase-migrations.yml` (requires secrets)

---

## API Surface and Proxies

Same‑origin API (Vercel):
- GET `/api/featured/site?ownerSlug={slug}`
  - Returns: `{ owner_slug, default_featured_character_id, enforce_admin_default }`
  - Handles fallback if `enforce_admin_default` column not present

- GET `/api/user/featured` (auth required)
  - Returns: `{ featured_character_id }` for current user via passed Authorization header

- POST `/api/user/featured` (auth required)
  - Body: `{ featured_character_id: <uuid|null> }`, upserts via RLS

Client repositories prefer same‑origin proxy first where RLS or device restrictions apply, else call Supabase directly.

---

## Features by Role

Super‑Admin
- Manage users (SuperadminUsersPage)
- Invite admins (AdminInvitesPage)
- Access all Admin areas

Admin
- Featured Character management (AdminFeaturedCharacter component)
  - Set/reset default featured (server‑backed)
  - NEW: enforce_admin_default flag (back‑end support; add UI toggle if desired)
- Admin Studies management (AdminStudiesPage)
- Potential visibility toggles for Characters

User (authenticated)
- Character chat with manual save (no auto‑save)
- My Walk page lists saved conversations; continue existing chats
- Favorites: server‑backed favorites list
- Featured preference: personal featured (user_settings) unless admin enforcement enabled on Home

Anonymous
- Browse characters, start chat (limited), view featured banner
- FAQ, Pricing, About, How‑it‑Works, etc.

All users
- Bible Studies: browse Studies, view Details, take Lessons
  - Lesson progress tracked; Mark Complete, Next/Prev
  - Study‑context chat: context injected, titles auto‑formatted `[Study] {Study Title} – Lesson {N}`
  - Premium gating bypass in study context (no paywall on study chats)

Roundtable
- RoundtableSetup and RoundtableChat pages for group interactions (persist and reload).

Resilience and UX improvements
- Characters repository: 6s timeout fallback to mock list if Supabase blocked (prevents hanging on some mobile devices)
- Same‑origin proxies for featured/user settings to bypass mobile CORS/privacy restrictions
- URL reset helpers: `?resetFeatured=1`, `?logout=1` (+ optional `&resetFeatured=1`)

---

## Current Status and Known Issues

Stability
- Featured character now resolves server‑first; admin default consistent across devices/domains; per‑domain auth explained (prod vs preview)
- Logout behavior fixed: UI clears immediately; URL‑driven logout available

Pending migration
- `enforce_admin_default` column not yet applied in Production
  - Until applied, Home won’t “force” admin default before user/local fallbacks

Legacy API conflicts
- Removed conflicting `/api/featured/site-json.*` endpoints to resolve Vercel path conflicts and ESM/CJS runtime issues

Mobile privacy/CORS
- On some devices, direct Supabase calls are blocked; proxies and timeouts implemented; continue to prefer proxies for user settings and site settings when appropriate

Conversation persistence
- Manual save only. Re‑hydration logic exists; requires verification across normal chat, roundtable, and study contexts (see Test Plans)

Bible Studies
- Core UX implemented (StudiesPage, Details, Lesson with progress)
- Need to validate study creation flow end‑to‑end in Admin; confirm “Fruits of the Spirit” availability in Production

---

## In‑Progress and Top Priorities

1) Apply migration and enforce Admin default on Home
   - Add column and set flag true for `owner_slug='faithtalkai'`
   - Verify `/api/featured/site?ownerSlug=faithtalkai` returns `enforce_admin_default: true`
   - Visit `/?resetFeatured=1` on prod and preview; confirm Home shows admin featured (URL param still overrides)

2) Verify conversation persistence everywhere
   - Normal Chat: save, refresh, continue; confirm messages re‑populate
   - Roundtable: same
   - Bible Study context: same; title auto‑formatting and context injection

3) Bible Studies creation/admin flow
   - Create a new Study with Lessons in Admin
   - Validate public browsing, details, lesson progression, progress saves

4) RLS hardening (PR 3)
   - Confirm/extend RLS policies for studies/lessons/series, progress tables, and conversations

---

## End‑to‑End Test Plans

Featured Character
- Admin sets default featured; verify banner on Home shows selection
- Turn on enforcement (after migration) → Home always shows admin default unless URL param present
- User sets personal featured; ensure Home ignores it when enforcement is on
- Device with blocked Supabase: ensure featured still resolves via same‑origin proxy

Auth/Logout
- Sign up, sign in, visit Home and My Walk
- Sign out via menu; confirm header immediately reflects logged‑out state
- Test URL logout: `?logout=1` (and `&resetFeatured=1`)

Conversations
- Normal chat: manual save, hard refresh, continue conversation; confirm full history
- Roundtable: start, save, reload; confirm persistence
- Study: open lesson, use study context chat, save and re‑open; confirm title `[Study] {Study} – Lesson {N}` and context returns

Studies
- Browse Studies; open Details; start Lesson; Mark Complete; Next/Prev; refresh; ensure progress persists
- Create a Study in Admin, add Lessons; verify front‑end renders and tracks progress

Mobile device edge cases
- Simulate slow/blocked Supabase: characters list falls back to mock and UI doesn’t hang
- Same‑origin proxies for featured/user settings function correctly

---

## Operations

Local development
- Install: `npm ci`
- Run dev: `npm run dev`
- Build: `npm run build`

Environment variables (Vite/Client)
- `.env.local` (typical):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_OWNER_SLUG` (e.g., `faithtalkai`)
  - OpenAI key(s) for chat proxy, if used client‑side via secure proxy

Serverless functions (Vercel)
- Set in Vercel Project Settings → Environment Variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - Any OpenAI/Stripe keys used in API routes

Migrations via GitHub Actions
- Workflow: `.github/workflows/supabase-migrations.yml`
- Requires repo “Production” environment secrets:
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_PROJECT_REF` (or `SUPABASE_PROJECT_ID`) → `sihfbzltlhkerkxozadt`
- Triggers on push to `supabase/migrations/**` or manual dispatch

Manual SQL (Supabase SQL editor)
- To apply enforcement now:
```sql
alter table public.site_settings
  add column if not exists enforce_admin_default boolean not null default false;

update public.site_settings
  set enforce_admin_default = true
  where owner_slug = 'faithtalkai';

select owner_slug, default_featured_character_id, enforce_admin_default
from public.site_settings
where owner_slug = 'faithtalkai';
```

Deployments
- Vercel auto‑deploys on push to main
- Cache bust for clients when diagnosing: add `?v=N` and use `Cmd/Ctrl+Shift+R`
- Reset featured helper: `?resetFeatured=1`
- Logout helper: `?logout=1` (optionally `&resetFeatured=1`)

Debugging tips
- If mobile shows different featured: ensure you’re logged in (sessions are per domain), then use `?resetFeatured=1`
- Check same‑origin endpoints:
  - `/api/featured/site?ownerSlug=faithtalkai`
  - `/api/user/featured` (requires login)
- Clear service workers/caches on stubborn devices; or open in Private window

---

## Credentials and Keys

Note: Do not commit secrets. The public anon key is intentionally embedded in the client for Supabase; serverless routes also read keys from env. Update any sensitive keys only via Vercel project settings and GitHub “Production” environment secrets.

- Supabase project:
  - URL/ref present in code: `src/services/supabase.js`
  - Anonymous key present in code (public by design for client ops)
- Vercel: serverless functions read `SUPABASE_URL` and `SUPABASE_ANON_KEY` from env; configure in Vercel dashboard
- OpenAI, Stripe: managed via env; do not hard‑code in repo

If rotation is required, rotate in Supabase/Vercel and update Vercel envs; rebuild/deploy.

---

## Future Roadmap

1) Video/audio session support (Zoom‑like)
   - Real‑time multi‑party audio/video chats with characters (synthetic voice), optional screen sharing
   - Consider WebRTC + SFU (e.g., LiveKit/Janus) with server‑driven character TTS/STT

2) Deep research tools
   - In‑app document workbench for scripture, commentaries, historical sources
   - Citation graph, timeline, geography overlays; export to notes/studies

3) Multi‑language support
   - Locale‑aware UI; model prompting in user’s language
   - Localized studies; character bios; Right‑to‑Left layouts where needed

4) RLS and audit hardening
   - Tighten policies for all study/progress tables and conversations
   - Add admin/super‑admin safeguards and audit logs

5) Performance and resilience
   - Server‑side rendering for critical paths
   - Asset optimization; edge caching; offline modes for studies

---

## Final Notes for the Next Droid

1) Start by reading the docs in the repo root (HANDOFF_FINAL.md, PROJECT_HANDOFF.md, this NEXT_DROID_HANDOFF.md), then scan the repositories in `src/repositories` and the contexts in `src/contexts`.
2) Confirm Production env vars in Vercel and secrets in GitHub “Production” environment for migrations.
3) Apply the `enforce_admin_default` migration, set it to true for `faithtalkai`, and verify with `/api/featured/site`.
4) Execute the End‑to‑End test plan; especially conversation save/load across Chat, Roundtable, and Studies.
5) Tackle the PR backlog: SeriesDetails improvements, RLS hardening, then begin roadmap features.

If anything is unclear, search the repo docs folder and previous hand‑off files; most known issues and fixes are recorded there. This project values reliable, testable UX under real‑world device constraints — prefer server‑first logic with graceful fallbacks.
