# Store Submission Prep

This doc contains ready-to-use metadata, privacy declarations, screenshot guidance, and exact commands to build and submit iOS and Android releases.

## App Identity
- Name: Faith Talk AI
- Bundle ID (iOS): com.faithtalkai.app
- Package (Android): com.faithtalkai.app
- Category: Education (secondary: Reference)
- Age Rating: 4+ (no mature content). Answer Apple questionnaire accordingly.

## Store Listing Copy
- Subtitle (iOS): Guided Bible conversations
- Short description (Android): Study the Bible with guided conversations.
- Long description:
  Faith Talk AI helps you study the Bible through guided conversations. Choose a biblical character or study, ask questions, and explore scripture with context. Save favorites, follow structured studies, and track your progress.

  Highlights:
  - Guided chat with curated biblical characters
  - Bible studies with lesson-by-lesson prompts
  - Favorites for quick access
  - Works across web and mobile

  Faith Talk AI is for learning and reflection. It’s not a substitute for pastoral counsel.

- Keywords: bible, bible study, christian, faith, jesus, scripture, devotional, study guide, prayer
- Support URL: https://faithtalkai.com/contact
- Marketing URL: https://faithtalkai.com
- Privacy Policy URL: https://faithtalkai.com/privacy

## App Review Notes (optional)
Test account available on request. App requires Supabase backend connectivity.

## Screenshots Guidance
Capture representative screens in dark theme:
- Login (wordmark)
- Home (stacked logo and buttons)
- New Chat (character list + filters)
- Chat (conversation with message bubbles)
- My Walk (favorites row + favorite chats)
- Studies (list and detail)

Recommended devices
- iOS: 6.7" (iPhone 15 Pro Max), 6.1" (iPhone 15/14), iPad Pro 12.9" (if desired)
- Android: 1080x1920 (portrait), 1440x2960 (portrait)

How to capture
1) Install Dev Client build on device or run Simulator/Emulator.
2) Ensure you’re signed in and seeded with at least one chat and favorite.
3) Use native screenshot (Cmd+S on iOS Simulator; Device screenshot on Android Emulator).
4) Export PNGs without annotations.

## Privacy Declarations
Apple – Data Types
- Collected: Email address (account), User ID (account). Not used for tracking, not linked to third parties.
- Not collected: location, contacts, health, financial, browsing, purchase, sensitive info.

Google Play – Data Safety
- Collected: Email, User ID (account). Purpose: Account management and app functionality.
- Not shared with third parties.
- Security: Data encrypted in transit, user can request deletion (support@faithtalkai.com).

## Build and Submit

Ensure clean install:
```
cd mobile
npm ci
npx tsc -noEmit
npx expo-doctor
```

Increment versions when needed (done in app.json):
- iOS: ios.buildNumber (string)
- Android: android.versionCode (integer)

Build release artifacts:
```
# iOS
npx eas build -p ios --profile production --non-interactive

# Android
npx eas build -p android --profile production --non-interactive
```

Submit to stores:
```
# iOS (requires ASC credentials configured in EAS)
npx eas submit -p ios --latest --non-interactive

# Android (requires Play Console JSON credentials configured)
npx eas submit -p android --latest --non-interactive
```

## Post-Submission Checklist
- App Store: fill Age Rating questionnaire, contact info, review notes.
- Play Console: complete Data Safety, Content rating, Target audience.
- Upload store listing text and screenshots for all required device sizes.
- Set pricing and distribution regions.
- Submit for review and monitor status.
