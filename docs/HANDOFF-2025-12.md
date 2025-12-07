## Faith Talk AI — Engineering Handoff (Dec 2025)

Faith Talk AI is a cross‑platform Bible study companion that lets users chat with curated biblical characters and guided studies. It includes a favorites system, persistent sessions, daily message limits, and polished branding (chat bubble + gold cross) across a React Native (Expo) mobile app and web.

Document location in repo: docs/HANDOFF-2025-12.md

### 1) Current Status (Today)
- Branding: Code-driven Wordmark (Inter Bold) with chat bubble + gold cross (#facc15) and gray bubble/text (#9ca3af) is live across mobile.
- Navigation: Chat tab keeps bottom tabs visible; ChatDetail has native back; My Walk shows saved chats; New Chat lists characters with favorites.
- Favorites: Supabase table user_favorite_characters with RLS; star toggle on cards; favorites chip/filter on New Chat; My Walk horizontal favorites.
- Session: Supabase client persists sessions via AsyncStorage.
- Daily counter: Wired via useAuth in ChatDetail; guardMessageSend and incrementDailyMessageCount receive user?.id.
- UI polish: Compact buttons (52px), chips (36px), compact My Walk cards (52px), stable login keyboard.
- Store prep: STORE_SUBMISSION.md created; production builds for iOS/Android completed.
- iOS splash/icon: App launch screen shows bubble + cross; device home-screen icon shows correctly. TestFlight thumbnail (“cover”) may lag cache.

### 2) Open Items / Next Steps
#### iOS
1. TestFlight thumbnail (cover) cache lag:
   - We regenerated the iOS marketing icon via ios.icon and shipped builds (buildNumbers 5, 6; version 1.0.1 build 1).
   - Launch screen and home-screen icon are correct. The TestFlight card image is Apple’s cached marketing icon and can take 24–48 hours to refresh. Action: monitor; if still unchanged, contact Apple Developer Support citing correct in-app icon and splash.
2. App Store submission (production):
   - After TestFlight verification, submit the build for review using App Store Connect (version 1.0.1). Use metadata in docs/STORE_SUBMISSION.md.

#### Android
1. Submission to Google Play:
   - Option A (interactive): from mobile/, run npx eas submit -p android --latest and follow prompts.
   - Option B (non-interactive): create a Google Play Service Account JSON and configure in eas.json. Provide track (internal/beta/production).
2. Store listing: populate app metadata, privacy, content rating, and screenshots per docs/STORE_SUBMISSION.md.

### 3) How to Build, Test, and Run
- Install deps: npm ci (in mobile/)
- Start dev: npm run ios or npm run android
- Typecheck: npx tsc -noEmit
- Doctor: npx expo-doctor
- iOS build (prod): npx eas build -p ios --profile production
- Android build (prod): npx eas build -p android --profile production
- Submit iOS (interactive): npx eas submit -p ios --latest
- Submit Android (interactive): npx eas submit -p android --latest

### 4) Project Structure (mobile)
- App.tsx: Navigation setup; Chat stack nested under tabs; BrandHeaderTitle using Wordmark.
- src/components/Wordmark.tsx: Inter Bold wordmark with chat bubble + cross; stacked/inline/iconOnly variants.
- src/screens/Login.tsx: Stacked Wordmark; keyboard-safe ScrollView.
- src/screens/ChatNew.tsx: Character list, favorites filter; chip heights 36; safe area padding.
- src/screens/ChatDetail.tsx: Conversation; uses useAuth and daily counter tier functions; header avatar + favorite star.
- src/screens/MyWalk.tsx: Compact cards (52px), favorites row; navigates into Chat stack properly.
- src/lib/favorites.ts: Supabase CRUD for favorites + visibility.
- src/lib/supabase.ts: AsyncStorage + persistSession.
- src/lib/tier.ts: Daily message counter helpers.
- src/lib/settings.ts: Realtime settings + cache clear.
- mobile/app.json: Icons, splash, bundle ids, versioning.
- mobile/assets/: icon.png, icon-ios.png (and variants), adaptive-icon.png, wordmark.png.

### 5) Versioning and Icons (iOS)
- CFBundleShortVersionString: expo.version (now 1.0.1)
- CFBundleVersion: expo.ios.buildNumber (reset to 1 for 1.0.1; increment for each new submission)
- Splash: expo.splash.image = ./assets/icon.png (bubble + cross)
- App icons:
  - iOS marketing/app icon derived from expo.ios.icon. Current: ./assets/icon-ios.png (opaque, no alpha).
  - Android adaptive icon: adaptive-icon.png foreground; backgroundColor #facc15.
- Note: TestFlight “cover” can take up to 24–48h after a new build to refresh. On-device launch and home-screen icon reflect immediately once installed.

### 6) Release Checklists
#### iOS
- [ ] Verify on-device launch shows bubble + cross
- [ ] Verify home-screen icon correct
- [ ] Submit latest build to TestFlight (interactive)
- [ ] If thumbnail still stale after 48h, open Apple support ticket
- [ ] When ready, submit for App Review with metadata from STORE_SUBMISSION.md

#### Android
- [ ] Choose submit mode: interactive or service account JSON
- [ ] Complete Play Console listing (privacy, content rating, screenshots)
- [ ] Submit latest build to chosen track

### 7) Troubleshooting
- Metro/packager cache: expo start -c, delete .expo, watchman watch-del-all, rm -rf node_modules && npm ci.
- Expo “SHA-1” mismatch: clear caches above and rebuild.
- Navigation back/tab loss: ensure ChatNew/ChatDetail are nested in Chat tab stack; use navigate, not replace.
- Daily counter not incrementing: ensure useAuth provides user?.id to tier functions in ChatDetail.
- Icon/splash mismatches: confirm app.json splash.image and ios.icon point to non-alpha PNGs.

### 8) Credentials & Services
- Supabase: URL and anon key provided via Expo public env vars.
- EAS: Project ID 6222913f-4fea-408e-b617-d83d820a66f1 (owner: stroka).
- iOS submit: Interactive flow OK; non-interactive requires ascAppId in eas.json.
- Android submit: Non-interactive requires Google Play Service Account JSON.

### 9) Immediate Action Items
1. iOS: Submit latest build under version 1.0.1; monitor TestFlight thumbnail up to 24–48h; escalate to Apple if still stale.
2. Android: Decide submission path (interactive vs. JSON) and submit.
3. Store listings: Complete descriptions, keywords, screenshots per STORE_SUBMISSION.md.

---
This document supersedes prior handoff notes and reflects the current, working state after branding restoration, navigation fixes, daily counter repairs, and store-prep work.
