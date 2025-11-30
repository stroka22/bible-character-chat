 # FaithTalk AI — Comprehensive Handoff (2025-11-30)
 
 This document is the single source of truth for the next Droid. It covers architecture, setup, environments, features, current issues, test plans, and next steps. Pair this with docs/INTRO_MESSAGE_2025-11-30.md for a quick start checklist.
 
 Important
 - Never commit secrets to the repo. Use secure sharing provided by the owner (password manager/vault). Store secrets in local .env files and EAS environment variables only.
 - Read the code before changing it. File paths are cited throughout.
 
 Repository and Code Map
 - GitHub: https://github.com/stroka22/bible-character-chat
 - Local path: /Users/brian/bible-character-chat
 - Web (React + Vite): src/
   - Pages: src/pages
   - Chat components: src/components/chat
   - Contexts: src/contexts
   - API routes (serverless): api/ (e.g., api/openai/chat.mjs)
   - Repositories: src/repositories
 - Mobile (Expo SDK 54): mobile/
   - Screens: mobile/src/screens
   - Libs: mobile/src/lib (supabase.ts, api.ts, tier.ts, storage.ts, chat.ts)
   - Config: mobile/app.json, mobile/eas.json, mobile/package.json
 
 Core Software and Integrations
 - React 18/19 + Vite (web)
 - Expo SDK 54 + expo-dev-client (mobile)
 - React Navigation (mobile)
 - Supabase (auth, data)
 - Stripe (billing/billing portal)
 - OpenAI API (via server-side proxy at api/openai/chat.mjs)
 - AsyncStorage + SecureStore fallback (mobile)
 
 Environments and Secrets (request from owner)
 - Server-side
   - OPENAI_API_KEY for api/openai/chat.mjs
   - Stripe secrets if production billing is enabled
 - Shared (web and mobile)
   - Supabase URL and anon key
   - API base URL for web’s serverless or deployed API
 - Mobile EAS profiles (mobile/eas.json)
   - Use EAS env vars for EXPO_PUBLIC_* runtime config (see below)
 
 Secrets Placement (do not commit)
 - Web local: create .env.local in repo root for Vite if needed
 - API local: create api/.env.local for serverless if using local runner
 - Mobile: set via EAS environment (EXPO_PUBLIC_*) and/or .env in development only (don’t commit)
 
 Environment Variables
 - Web (Vite convention)
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_API_BASE_URL (if calling deployed API)
 - API (serverless)
   - OPENAI_API_KEY
   - STRIPE_* (if used)
 - Mobile (read in runtime)
   - EXPO_PUBLIC_SUPABASE_URL
   - EXPO_PUBLIC_SUPABASE_ANON_KEY
   - EXPO_PUBLIC_API_BASE_URL
 
 Setup — Web (React)
 1) Node: 20.x recommended
 2) Install
    npm ci
 3) Run (Vite dev)
    npm run dev
 4) Serverless API (local, optional): ensure OPENAI_API_KEY in env, then run your local serverless runtime if applicable; in production it runs on the host where deployed
 
 Setup — Mobile (Expo)
 1) Prereqs: Xcode (iOS), Android SDK/Studio, EAS CLI, Expo CLI
 2) Install deps
    cd mobile
    npm ci
 3) Dev client build (once per change in native deps)
    npx eas build -p ios --profile development
    npx eas build -p android --profile development
 4) Start Metro with runtime env
    export EXPO_PUBLIC_SUPABASE_URL=...
    export EXPO_PUBLIC_SUPABASE_ANON_KEY=...
    export EXPO_PUBLIC_API_BASE_URL=...
    npm run start
 5) Open on device with Expo Dev Client
    Use tunnel/QRCode; ensure app connects to Metro
 
 Mobile Notes (critical)
 - Reanimated and react-native-worklets were removed to resolve iOS crash (WorkletsModule bridgeless assertion). Do not reintroduce without planning bridgeless/new-arch.
 - Supabase init guards invalid URLs (mobile/src/lib/supabase.ts). Env must be present or it will short-circuit.
 - Storage wrapper (mobile/src/lib/storage.ts) falls back from AsyncStorage to SecureStore to avoid NativeModule null issues on older dev clients.
 
 Key Code Paths (Web)
 - Chat context and message pipeline: src/contexts/ChatContext.jsx
 - Chat UI: src/components/chat/SimpleChatWithHistory.js (+ ChatBubble, ChatInput, etc.)
 - OpenAI proxy: api/openai/chat.mjs
 - Studies: src/pages/StudyDetails.jsx, src/pages/StudyLesson.jsx
 - Studies repositories: src/repositories/bibleStudiesRepository.js
 - Admin/Account/Tier: src/pages/admin/*, src/utils/accountTier, src/services/tierSettingsService
 
 Key Code Paths (Mobile)
 - App entry & tabs: mobile/App.tsx
 - Screens: mobile/src/screens/* (ChatList, ChatNew, ChatDetail, StudiesList, StudyDetail, Roundtable*)
 - Supabase & API config: mobile/src/lib/supabase.ts, mobile/src/lib/api.ts
 - Gating & limits: mobile/src/lib/tier.ts
 - Storage wrapper: mobile/src/lib/storage.ts
 
 Feature Inventory (Implemented)
 - User
   - Auth (Supabase)
   - Character chat (web and mobile)
   - Bible Studies: list, details, lessons, guided chat context
   - Roundtable (multi-character) – web complete; mobile implemented
   - My Walk / Favorites; favorite toggle in chat header (mobile)
   - Daily message limits for free tier; upgrade prompts
   - Premium gating (characters and studies), per-organization tier settings
   - Polished UI theme and logo branding
 - Admin
   - Admin pages and org gating controls (tier settings persistence)
   - Featured/price id utilities and weekly admin CSV (api/*)
 - Super Admin
   - Elevated admin actions and bypass flags as needed in admin pages (see src/pages/admin)
 
 Recent Fixes and Improvements
 - iOS crash (react-native-worklets) resolved by removing reanimated/worklets
 - Supabase guard + env fallbacks (mobile/src/lib/supabase.ts)
 - API base URL runtime env for dev client (mobile/src/lib/api.ts)
 - Gating foundation + Stage 2 limits and favorites
 - Studies: Introduction fallback when lesson index 0 is missing (src/pages/StudyLesson.jsx)
 - Chat: Inject synthetic Introduction context when launched with lesson=0 (src/components/chat/SimpleChatWithHistory.js)
 - Navigation: Floating Home button on study pages (web)
 
 Current Issues / In-Progress
 - Web
   - Confirm “Start” reliably lands on Introduction for all studies and chat follows study prompt
   - Ensure Home navigation is available throughout study flow (floating button added)
 - Mobile (Stage 2)
   - Verify daily message limit behavior (free vs premium)
   - Verify character gating for free users vs premium
   - Validate Studies navigation and chat context injection
   - Validate favorites and My Walk
 - Build/Env
   - Confirm EAS iOS/Android development builds succeed with current deps
   - Confirm OPENAI proxy works in deployed environment
 
 Test Plan (Smoke)
 - Web
   1) Login → Home
   2) Open a study → Click Start → Expect Introduction (lesson 0) page
   3) Click Start inside lesson → Chat opens; first message references study context
   4) Navigate back to Home using floating button
   5) Try premium study as free user → See upgrade prompt
 - Mobile
   1) Install dev client; open app; login
   2) Chat with free character, send 5 messages as free user → sixth should prompt upgrade
   3) Try premium character as free user → prompt upgrade
   4) Open Studies → navigate into a study → open lesson → launch chat, verify context
   5) Favorite a chat → show in My Walk
 
 Branches and PRs
 - fix/study-lesson-home-link: adds floating Home button across study pages (web)
 - fix/chat-intro-context-lesson0: synthetic lesson 0 context in chat
 - feat/mobile-stage-2: Stage 2 gating, limits, favorites, studies (mobile) — create PR if not open
 
 Operational Runbooks
 - iOS Dev Client (new device or native changes)
   - npx eas build -p ios --profile development
   - Install via EAS; open the dev URL (tunnel) from CLI
 - Android Dev Client
   - npx eas build -p android --profile development
   - Install .apk/.aab accordingly
 - Metro Troubleshooting
   - Kill existing metro; clear cache; ensure tunnel enabled
 - Crash Logs (iOS)
   - Settings → Privacy & Security → Analytics → Analytics Data (device)
   - Look for the app’s crash with timestamp
 
 Security and Compliance
 - Do not commit .env files or keys
 - The repo’s secret scanner may block pushes that resemble secrets — this is expected and desirable
 - Keep RCT_NEW_ARCH_ENABLED=0 in mobile/eas.json unless you fully re-enable Reanimated and test bridgeless/new-arch
 
 Future Roadmap
 - Real-time audio and video discussions (Zoom-like) with characters
 - Deep research tools: scripture provenance, cross-references, scholarly sources
 - Multilingual model support (Spanish, Portuguese first)
 - Server-side streaming responses with robust retry and tracing
 - Push notifications, offline caching, and performance profiling
 
 What to Tackle Next (Order)
 1) Web: End-to-end study flow — Start → Introduction → Guided Chat → Home navigation
 2) Mobile: Full Stage 2 regression on iOS and Android, resolve any gating or context edge cases
 3) Open PR for feat/mobile-stage-2 and merge once green
 4) Validate deployed OpenAI proxy and Stripe (if enabled); otherwise keep billing disabled visibly
 
 Need Credentials
 - Request: OPENAI_API_KEY, Supabase URL + anon key for the active org, Stripe keys (if used), Expo/EAS access. Place them in local env and EAS env; do not commit.
 
 You’re set. Read this file top-to-bottom once, then execute the Quick Start steps and verify the smoke tests.