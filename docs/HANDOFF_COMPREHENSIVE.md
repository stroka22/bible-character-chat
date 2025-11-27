# FaithTalkAI – Comprehensive Handoff

This document provides complete context for the next developer (“Droid”). It explains the stack, environments, code structure, implemented features, current issues, and the exact next steps to resume work. Read this document end‑to‑end before making changes.

Last updated: 2025‑11‑27

---

## 1) Project Overview

FaithTalkAI is a web + mobile product for character‑directed Bible studies and “Roundtable” discussions:
- Explore and complete studies and lessons (web + mobile)
- Administer studies per organization
- Distribute studies across organizations
- Facilitate “Roundtable” chats (biblical characters discuss a topic)
- Monetize via organization subscriptions (Stripe)

Primary repository and path:
- GitHub: https://github.com/stroka22/bible-character-chat
- Local path (on Brian’s Mac): /Users/brian/bible-character-chat

---

## 2) Architecture and Runtime Interactions

- Web app: Vite + React, served by Vercel
  - Consumes Supabase (PostgREST)
  - Hits Vercel serverless endpoints under `/api` for Stripe and OpenAI proxy

- Serverless API (Vercel):
  - Stripe checkout session creation and helpers
  - Admin Org price discovery endpoint
  - OpenAI proxy for character chat

- Database: Supabase (Postgres + RLS)
  - Core tables used in code:
    - `bible_studies`
    - `bible_study_lessons`
    - `user_study_progress`
    - `characters`

- Mobile app: Expo React Native (SDK 54) with EAS build
  - Uses Supabase (anon client)
  - Calls web API base URL for OpenAI proxy: `${EXPO_PUBLIC_API_BASE_URL}/api/openai/chat`
  - Uses development client for on‑device debugging

- Payments: Stripe
  - Admin Organization subscription plans: $97 monthly, $970 yearly
  - Web flow uses secure serverless checkout session creation

---

## 3) Environments and Secrets (Where They Live)

Do not commit secrets. Retrieve/manage them in provider dashboards.

- Vercel (Web/API hosting)
  - STRIPE_SECRET_KEY
  - VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY
  - VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY
  - OPENAI_API_KEY
  - Location: Vercel Project → Settings → Environment Variables

- Stripe
  - Live/test secret keys; price IDs for Admin Org plans
  - Stored in Vercel env vars (above)

- Supabase
  - Project URL and anon key (public) used by web/mobile
  - Web client: `src/services/supabase.js`
  - Mobile: injected via Expo EAS env → read from `mobile/app.json` extra

- Expo/EAS (Mobile builds)
  - EAS environment variables (created previously):
    - EXPO_PUBLIC_SUPABASE_URL
    - EXPO_PUBLIC_SUPABASE_ANON_KEY
    - EXPO_PUBLIC_API_BASE_URL (your deployed web/API origin)
  - Set via `eas env:create`

- Apple Developer
  - Team: Brian Stroka (7KZD6XWTXT)
  - Device UDIDs must be registered to install internal/dev builds
  - Apple imposes ~1 hour security delay after new device registration

- Local env files and helper scripts
  - Root `.env` (for web dev). Use `./fix-environment.sh` to scaffold/update safely.
  - Mobile env flows through EAS; values surfaced via `mobile/app.json` → `extra`.

---

## 4) Code Map – Start Here

Web (root):
- package.json (scripts/deps)
- vite.config.ts
- Supabase client: `src/services/supabase.js`
- Admin upgrade (Stripe): `src/pages/AdminUpgrade.jsx`
- Studies page (superadmin owner filter + UI dedupe): `src/pages/StudiesPage.jsx`
- Repo/data layer: `src/repositories/bibleStudiesRepository.js`
  - `listStudies`, `listLessons`, `upsertStudy`, `upsertLesson` (reordering to avoid PK collisions)
  - `deleteStudy`, `deleteLesson`
  - `cloneStudyToOwners` (distribution with collision‑safe title suffixes)

API (Vercel functions):
- `api/create-checkout-session.js` (Stripe session; env validation)
- `api/admin-price-ids.js` (runtime price ID discovery + presence flags, mode)
- `api/openai/chat.mjs` (OpenAI proxy for character chat)
- Other helpers: `api/stripe-get-subscriptions*.js`, `api/weekly-admin-csv.mjs`

Mobile (Expo RN – `/mobile`):
- app.json (bundle IDs, extra config; `newArchEnabled: false`)
- eas.json (profiles: development, preview, simulator, production)
- Entry: `mobile/App.tsx` (Navigation + ErrorBoundary + AuthProvider)
- Auth: `mobile/src/contexts/AuthContext.tsx`
- Supabase: `mobile/src/lib/supabase.ts`
- API client: `mobile/src/lib/api.ts` (uses `EXPO_PUBLIC_API_BASE_URL`)
- Screens: Login, StudiesList, StudyDetail, RoundtableSetup, RoundtableChat
- ErrorBoundary: `mobile/src/components/ErrorBoundary.tsx`

Docs in repo root worth skimming:
- README.md, START_HERE.md
- PROJECT_HANDOFF.md, NEXT_SESSION_HANDOFF.md, NEXT_DROID_HANDOFF.md, HANDOFF.md, HANDOFF_FINAL.md
- TROUBLESHOOTING*.md, AUTHENTICATION-GUIDE.md, TESTING_CHAT.md, DEPLOYMENT.md, DATABASE-FIX-GUIDE.md

---

## 5) Implemented Features (By Role)

Super‑Admin
- “All owners” studies view with UI‑level dedupe by normalized title → `src/pages/StudiesPage.jsx`
- Distribute a study to target orgs with collision‑safe title suffixing; optional lesson copy → `cloneStudyToOwners`
- Admin/superadmin deletes for studies/lessons (RLS enforced) → `bibleStudiesRepository.js`
- Weekly CSV utilities and admin scripts → `api/weekly-admin-csv.mjs` (+ docs)
- Superadmin users page → `src/pages/admin/SuperadminUsersPage.jsx`

Admin (Organization)
- Admin Org subscription upgrade page for $97/mo or $970/yr, with runtime price fallback → `AdminUpgrade.jsx`, `api/admin-price-ids.js`, `api/create-checkout-session.js`
- Study & lesson management; insertion/reordering with collision‑safe algorithm → `upsertLesson`
- Premium gating in UI for premium studies → `StudiesPage.jsx`
- Admin pages: `src/pages/admin/*`

End Users
- Web browsing of public studies; details and lessons
- Progress tracking: `saveProgress` / `getProgress` (`user_study_progress`)
- Mobile app:
  - Supabase email/password auth
  - Studies list + detail
  - Roundtable (topic + selected characters) generating sequential character responses via OpenAI proxy

---

## 6) Current Status and Known Issues

Web/Admin
- Admin Org checkout correctly uses Admin price IDs ($97/$970)
- `/api/admin-price-ids` reports IDs, presence flags, and live/test mode
- Lesson “duplicate key at 3rd lesson” fixed by app‑side reordering
- Study distribution and UI dedupe are in place

Mobile
- Android preview build succeeds and runs
- iOS:
  - New architecture disabled; gesture handler and native deps aligned
  - App still crashes on a physical iPhone due to a JS runtime exception (SIGABRT in ExceptionsManagerQueue)
  - Dev client + ErrorBoundary added to surface the exact JS error/stack
  - Blocked by Apple’s ~1‑hour security delay after device registration; “Install” appears once the delay expires

---

## 7) Immediate Next Steps (Unblock iOS and Fix Crash)

After Apple delay expires:
1. Build & install iOS dev client
   - `cd mobile`
   - `npx eas build -p ios --profile development`
   - On iPhone (Safari signed into expo.dev): open the new build → Install
   - If “Untrusted Developer”: Settings → General → VPN & Device Management → Developer App → Trust
2. Start Metro with tunnel and connect dev build
   - `npx expo start --dev-client --tunnel`
   - Open FaithTalkAI dev app → Scan QR inside the app
3. Reproduce crash and capture red screen stack / ErrorBoundary output
4. Fix root cause (likely env access, navigation, or initialization), verify on device
5. Validate roundtable flow and studies end‑to‑end on iOS
6. Produce internal testing builds
   - iOS: `npx eas build -p ios --profile preview`
   - Android: `npx eas build -p android --profile preview`

---

## 8) Test Plan Checklist

Web
- Admin Org upgrade at `/admin/upgrade` uses correct Admin price IDs and returns to success URL
- “All owners” shows deduped studies; navigation to detail/lessons works; premium gating enforced
- Lessons: create/move/delete at various positions → no unique/index conflicts
- Distribution: clone studies to target orgs with suffixing; verify no collisions
- Weekly CSV: verify schedule or manual trigger path

Mobile
- Auth: sign in/out, session persistence
- Studies: list/detail via Supabase
- Roundtable: setup, chat (character responses via OpenAI proxy), error fallback messages
- Env: missing EXPO_PUBLIC_* yields clear logs / boundary text
- Native: cold/warm launches; foreground/background transitions

---

## 9) Local Development

Web
- Node 20 LTS recommended
- Install: `npm ci`
- Dev: `npm run dev`
- Build: `npm run build && npm run preview`
- Env: `./fix-environment.sh` to scaffold/update `.env`

Mobile
- Install: `cd mobile && npm ci`
- Dev client (iOS):
  - Register device if needed: `npx eas device:create --platform ios`
  - Build: `npx eas build -p ios --profile development`
- Run JS with Metro: `npx expo start --dev-client --tunnel`
- Required EAS env: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_BASE_URL

---

## 10) Security & Secrets Handling

- Keep secrets in Vercel/EAS/Stripe/Supabase dashboards; do not commit to Git or share in chat
- Review diffs before commits for accidental secrets (e.g., `.env`)
- Supabase anon key is public by design but still rotate if exposure suspected

---

## 11) Improvements In Progress & Roadmap

In Progress
- Capture iOS JS crash stack via dev client and fix root cause
- Improve environment validation pathways in mobile/web

Future Roadmap
- Video/audio “Roundtable” sessions (Zoom‑like) using a real‑time SDK (LiveKit/Twilio/WebRTC)
- Deep biblical research tools (retrieval, semantic search, sources/citations)
- Multi‑language support (i18n across web/mobile; language‑aware prompts)
- Observability: Sentry for RN, serverless logs, Supabase logs/dashboards
- Offline caching for studies in mobile

---

## 12) Accounts & Ownership Inventory

- GitHub: `stroka22/bible-character-chat`
- Vercel: hosts web + `/api`
- Stripe: Admin Org subscription prices ($97 monthly, $970 yearly)
- Supabase: project referenced in `src/services/supabase.js`
- Expo/EAS: owner `stroka` (device registration + builds)
- Apple Developer: Team Brian Stroka (7KZD6XWTXT)

---

## 13) Definition of Done – Current Milestone

- iOS dev client installs and connects to Metro
- JS error/stack captured → root cause fixed → stable iOS launch
- Android preview remains green
- Web admin checkout verified with correct Admin Org price IDs
- Studies/lessons/distribution regression‑tested

---

End of document.
