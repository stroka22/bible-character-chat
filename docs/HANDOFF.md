# FaithTalkAI – Engineering Handoff

Owner: B MS  
Repo root: /Users/brian/bible-character-chat  
Mobile app: /Users/brian/bible-character-chat/mobile

Read this document end‑to‑end before making changes. It contains setup, architecture, current status, open issues, release steps, and roadmap.

## 0) TL;DR Start Here
- Code: mobile app lives in `mobile/` (Expo/React Native, SDK 54)
- Env: set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` via EAS or local `.env`
- Run: `cd mobile && npm install && npx expo start --dev-client -c`
- Typecheck/doctor: `npx tsc -noEmit` and `npx expo-doctor` (should be green)
- Active branch/PR: `fix/mobile-logo-and-favorites-polish` → PR #249
- Immediate actions:
  1) Implement character visibility filter (hide draft/not viewable) everywhere
  2) Build Android Dev Client and validate parity
  3) Complete store submissions for iOS and Android

---

## 1) Product Overview
FaithTalkAI helps users study the Bible through guided conversations with curated “characters” and structured studies. The mobile app (iOS/Android via Expo) integrates directly with Supabase for data, auth, and storage.

## 2) Repositories and Structure
- This handoff covers the mobile app located at `mobile/`.
- Key files:
  - `mobile/App.tsx`: navigation, header branding, Home hero wordmark sizing
  - `mobile/src/components/Wordmark.tsx`: code‑rendered Inter Bold wordmark (bubble + “FaithTalkAI”)
  - `mobile/src/screens/Login.tsx`: auth UI, keyboard handling, stacked wordmark
  - `mobile/src/screens/ChatNew.tsx`: character discovery and chat creation
  - `mobile/src/screens/ChatDetail.tsx`: chat thread, header favorite star, back button
  - `mobile/src/screens/MyWalk.tsx`: favorites row + favorited chats
  - `mobile/src/screens/StudiesList.tsx`, `mobile/src/screens/StudyDetail.tsx`: studies browsing
  - `mobile/src/lib/supabase.ts`: Supabase client with AsyncStorage and persistSession
  - `mobile/src/lib/favorites.ts`: favorite characters persistence
  - `mobile/src/theme.ts`: color system (navy/gold theme)
  - `mobile/app.json`: Expo config (icons, extra env)

## 3) Tooling
- Expo SDK 54 (React Native 0.81, React 19)
- EAS for builds/submissions
- Supabase (Postgres, Auth, Storage, RLS)
- TypeScript
- Fonts: `@expo-google-fonts/inter` + `expo-font` (Inter_700Bold)

## 4) Environment & Secrets
- Required public env (EAS or `.env`):
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Optional: `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_ROUNDTABLE_FREE`
- The app also reads `extra` from `app.json` as a fallback. Prefer EXPO_PUBLIC_* at runtime.
- Secrets are not committed. Store them in EAS secrets or local `.env` ignored from VCS.

## 5) Run/Validate
```bash
cd mobile
npm install
npx expo start --dev-client -c
npx tsc -noEmit
npx expo-doctor
```

## 6) Build & Ship
Dev clients:
- iOS: `npx eas build -p ios --profile development-client`
- Android: `npx eas build -p android --profile development-client`

Production builds:
- iOS: `npx eas build -p ios --profile production`
- Android: `npx eas build -p android --profile production`

Submission:
- iOS: `npx eas submit -p ios --latest`
- Android: `npx eas submit -p android --latest`

Access required: App Store Connect and Google Play Console (invite the engineer), signing set up in EAS, bundle identifiers (iOS) and package name (Android).

## 7) Branding & UI Conventions
- Wordmark component (`src/components/Wordmark.tsx`)
  - Bubble/border: gray `#9ca3af`; Cross: gold `#facc15`
  - Text: “FaithTalk” gray, “AI” gold, Inter_700Bold
  - Variants: `stacked` (home/login), `inline`, `iconOnly` (headers)
- Sizing: Home/Login use ~70% of viewport width (capped). Headers show iconOnly for fit.
- Theme colors in `src/theme.ts` (navy background, gold primary, light muted gray).

## 8) Implemented Features
User
- Auth with persistent sessions (Supabase + AsyncStorage)
- New Chat: search, alphabet filter, favorites filter, opening line injection
- ChatDetail: native header with back button, star favorite toggle
- Favorites: characters + chats; My Walk shows favorites row and favorited chats
- Studies browsing (list/detail)

Admin/Super‑Admin (data‑driven)
- Character premium gating via tier helpers and “free list” logic
- Roundtable feature flag (free/premium gate)
- Favorites stored in Supabase with RLS policies

Tech plumbing
- Supabase client configured with `persistSession: true`
- Inter font loading and code‑rendered wordmark (no image dependency)
- Metro resolution compatibility fixes

## 9) Data Model (high level)
- `characters`: `id, name, description, avatar_url, persona_prompt, opening_line, ...`
- `user_favorite_characters`: `user_id, character_id` (RLS: per‑user data)
- `chats`: `id, user_id, character_id, title, is_favorite, updated_at`
- `chat_messages`: `id, chat_id, role, content, created_at`

Confirm exact schema in Supabase; the app expects the above fields at minimum.

## 10) Visibility (“draft/not viewable”)
Current code in `ChatNew.tsx` does NOT filter for visibility flags by default. If you mark a character as “draft/hidden,” it may still appear unless RLS hides it. To enforce app‑side hiding, add something like:
```ts
supabase.from('characters')
  .select(...)
  .eq('is_active', true)        // example
  .eq('is_draft', false)        // example
```
Apply the same filter to any character lists (Favorites, My Walk) and guard chat creation.

## 11) Current Status (PR #249)
- Wordmark component added; stacked on Home/Login; iconOnly in headers
- Login keyboard stability improved; reserved logo space
- New Chat letter chips height fixed; empty state when no results
- My Walk favorites row is compact (no blank space)
- Back button restored in ChatDetail; header shows avatar + name; star styling
- Android parity & store builds pending

## 12) Testing Checklist
- Login: no shake, logo visible on small devices
- New Chat: search, alphabet strip, favorites filter; chips never stretch; empty state shows
- ChatDetail: back button present; star toggles favorite state; free tier gating works
- My Walk: favorite/unfavorite updates reflect across screens
- Visibility: hidden/draft characters do not show (after you implement filters)
- Android: Dev Client parity with iOS (keyboard, chips, performance)

## 13) Release Readiness
- `npx tsc -noEmit` and `npx expo-doctor` are green
- Icons/adaptive icons confirmed (see `app.json`)
- EAS secrets set (Supabase URL/Anon key)
- iOS/Android production builds created and submitted
- Store metadata, screenshots, privacy policy, and links validated

## 14) Roadmap / Future Work
- Video/Audio “Roundtable” sessions (Zoom‑like) with recording and transcripts
- Deep research tooling (references, commentaries, cross‑translations)
- Multilingual UI and answer generation
- Offline caching for studies and recent chats
- Token control/summarization for long chats

## 15) Conventions & Process
- Branches: feature/*, fix/*; do not commit to default branches
- Keep worktree clean; run typecheck and doctor before PRs
- Keep changes small & focused; include screenshots or build links in PRs

## 16) Access
- App Store Connect and Google Play Console invitations required to build/submit
- Supabase project access for schema edits and RLS policies
- All secrets managed via EAS or local `.env` (not in repo)

---

Questions or clarifications: document them in a new PR under `docs/` and reference affected files.
