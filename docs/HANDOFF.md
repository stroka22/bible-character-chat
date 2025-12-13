# Faith Talk AI — Comprehensive Handoff

Read this end-to-end before making changes. It contains system context, environment setup, platform interactions, deployment, features by role, current issues, test plans, and next steps.

Start with INTRO.md in the repo root for a quick orientation.

---

## 1) Overview

Faith Talk AI is a multi‑platform Bible character conversational experience:
- Web: SPA hosted on Vercel with static legal/support pages.
- Mobile: iOS and Android apps built with Expo (EAS) + React Native.
- Backend: Supabase (Postgres, Auth, RLS, Edge Functions). Stripe used via Supabase functions (non‑iOS payments).

Monetization (iOS Path A): iOS app unlocks premium features and hides all upgrade/purchase CTAs. No IAP, no external links in‑app.

Current Priority: Fix Roundtable behavior and UX; complete iOS submission and prepare Android release.

Repository: https://github.com/stroka22/bible-character-chat

---

## 2) Codebase Structure

Top‑level highlights:

- mobile/
  - Expo React Native app.
  - app.json: platform config (bundle identifiers, build numbers). iOS buildNumber currently 13.
  - eas.json: EAS build/submit profiles (development, preview, production, simulator).
  - package.json: scripts for EAS build/submit.
  - src/
    - lib/
      - tier.ts: Tier settings and premium gating. iOS short‑circuit (Path A) implemented.
      - settings.ts: Network‑first site/roundtable settings + foreground refresh/polling.
      - supabase.ts: Supabase client initialization.
      - favorites.ts, chat.ts, etc.: supporting modules.
    - screens/
      - Profile.tsx: Shows Premium on iOS; hides Upgrade & daily meter.
      - ChatNew.tsx: iOS treated as premium for character gating.
      - RoundtableSetup.tsx: iOS uses premium participant limits.
      - StudyDetail.tsx: Fixed nested navigation to ChatDetail for Bible Studies.
    - App.tsx: AppState foreground refresh + periodic polling.

- public/
  - privacy.html, terms.html, support.html: Static pages with verbatim content provided by owner.
  - robots.txt, sitemap.xml: SEO.

- index.html: Open Graph + Twitter meta for sharing.

- vercel.json: Rewrites to serve static pages before SPA catch‑all.

- scripts/: SQL and utilities (seeds, policies, logo pack, etc.).

- supabase/
  - functions/: Stripe checkout/portal, get subscription, delete user (role‑checked), etc.
  - migrations/: DB schema migrations.

---

## 3) Environments & Secrets

Do not commit secrets. Manage them in providers:

- Expo/EAS (mobile):
  - EXPO_PUBLIC_SUPABASE_URL
  - EXPO_PUBLIC_SUPABASE_ANON_KEY
  - EXPO_PUBLIC_API_BASE_URL (if applicable)
  - Stored per build profile (preview/production).

- Vercel (web):
  - Environment variables managed in Vercel dashboard.
  - Static pages require no secrets.

- Supabase:
  - URL and anon key for clients.
  - Service role key is server‑only (Edge Functions). Never ship to clients.

Reviewer credentials are NOT stored in this repo. Coordinate with the owner or retrieve from secure secret stores (Expo/EAS, password manager, or direct handoff).

---

## 4) How Things Interact

- Mobile apps use Supabase for Auth and data and call Edge Functions for Stripe/admin needs.
- Web app is a SPA pointed to the same Supabase backend and hosts static legal/support pages for compliance.
- Stripe: Used via Supabase Functions for non‑iOS subscription flows.

---

## 5) Build, Deploy, Submit

Mobile — iOS
- EAS project: @stroka/faithtalkai
- Bundle Identifier: com.faithtalkai.app
- App Store Connect App ID: 6756217967
- Version: 1.0.1 (build 13)
- Path A implemented in code (iOS treated as premium, Upgrade hidden)

Mobile — Android
- Package: com.faithtalkai.app
- Build via EAS with preview/production profiles.

Web — Vercel
- Static pages (/privacy, /terms, /support) and SPA routing (vercel.json rewrites in place).

SEO
- robots.txt & sitemap.xml present.
- OG/Twitter meta tags in index.html.

---

## 6) Implemented Features

Superadmin
- Cross‑org access; delete-user Edge Function with role checks.
- Manage tier/roundtable settings and characters globally.
- Network‑first settings with app foreground refresh.

Admin
- Owner‑scoped via profiles.owner_slug.
- Manage characters visibility and org settings.
- Tier settings: free limits, free characters, roundtable gates.

User
- Email/password login.
- Profile shows org and status; iOS shows Premium with no Upgrade/daily meter.
- New Chat with characters; favorites management.
- Bible Studies start correctly (nested navigation fix applied).
- Roundtable creation, participant selection, topic entry (issues listed below).

App‑wide
- iOS Path A: premium gates bypassed; no purchase links in app.
- Static legal/support pages match owner‑provided content.
- SEO assets and social meta configured.

---

## 7) Known Issues (Top Priority)

Roundtable (observed on TestFlight build 13):
- Follow‑up answers are often identical across participants.
- No explicit "advance to next round" control visible.
- Save operation appeared to succeed but the conversation did not persist.

Action Plan:
1) Response Diversity
   - Ensure each participant’s turn includes persona context, role/turn memory, and round index.
   - Verify we’re not reusing the same output across participants (race/queue/state bug).
   - Consider small sampling adjustments (temperature/top_p) per participant to reduce duplication while keeping coherence.

2) Round Controls
   - Add a clear "Next round" button gated to the host.
   - Persist round counters and disable further turns until advanced.

3) Persistence
   - Ensure save writes a full transcript (participants, rounds, turns) and appears in history.
   - Re‑check RLS/policies and any relevant tables for writes.
   - Add visible confirmation on success and surface errors.

4) Parity
   - Validate identical behavior on Android, and align desktop expectations where applicable.

---

## 8) Test Plan (Smoke Checklist)

Auth
- Sign up, sign in, sign out. Reset password link opens in web.

Profile
- iOS: shows Premium; no Upgrade button; no daily meter.
- Android/Web: Upgrade surfaces as configured.

Characters & Chats
- Browse/search; add/remove favorites.
- Premium gating: iOS ungated; Android/Web respect tier settings.

Bible Studies
- Start from list → opens ChatDetail; messages send/receive; saving works.

Roundtable
- Create with participant cap per plan (iOS uses premium max).
- Distinct follow‑ups per participant per round.
- Next round control visible and functional.
- Save persists and reloads from history.

Settings Refresh
- Admin changes propagate on app foreground and via periodic polling (network‑first).

Static Pages & Links
- /privacy, /terms, /support load correctly and match the verbatim content.
- External links and share previews (OG/Twitter) work.

App Store (iOS)
- Correct version/build. Review notes include Path A (no IAP). Reviewer creds provided out‑of‑band.

---

## 9) Conventions & Notes

- Never commit secrets. Use EAS/Vercel/Supabase dashboards for envs.
- Use feature branches + PRs; don’t commit to main directly.
- For mobile, run installs frozen:
  - In repo root: `npm ci`
  - In mobile/: `npm ci`
- Keep Path A logic iOS‑only; Android/Web maintain configured monetization.
- Respect RLS and roles (user/admin/superadmin) when changing DB writes.

---

## 10) Roadmap / Future Improvements

- Bible integration: full text with references, highlights, and cross‑links.
- Video/Audio “Zoom‑like” roundtables with TTS/STT and orchestrated turn‑taking.
- Deep research tools: sources, commentary summaries, provenance on responses.
- Multi‑language: localized prompts/personas and UI translation.

---

## 11) Useful Links

- Repo: https://github.com/stroka22/bible-character-chat
- Legal/support pages: https://faithtalkai.com/privacy • https://faithtalkai.com/terms • https://faithtalkai.com/support
- App Store Connect (builds): https://appstoreconnect.apple.com/apps/6756217967/testflight/ios
- EAS submission example: https://expo.dev/accounts/stroka/projects/faithtalkai

---

## 12) Current Status Snapshot

- iOS build 13 (1.0.1) processed; ready for submission with Path A notes.
- Roundtable requires fixes for diversity, next‑round control, and persistence.
- Static legal pages and SEO are live and verified.
