# FaithTalkAI Mobile (Expo)

Native app built with Expo + React Native.

## Configure

Set these environment variables for builds (no secrets are committed):

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_API_BASE_URL (points to your web app hosting /api/openai/chat)

These are referenced in `app.json` via `expo.extra` and read at runtime with `expo-constants`.

## Build with EAS

1) Install EAS CLI (optional, scripts use `npx`):

```bash
npm i -g eas-cli
```

2) Initialize project (once):

```bash
cd mobile
eas init
```

3) Add secrets (EAS > Project > Secrets) or via CLI:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <url>
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon>
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://yourapp.com
```

4) Internal builds (preview profile):

```bash
npm run build:ios:preview
npm run build:android:preview
```

5) Submit latest builds:

```bash
npm run submit:ios
npm run submit:android
```

## Run locally

```bash
cd mobile
EXPO_PUBLIC_SUPABASE_URL=... EXPO_PUBLIC_SUPABASE_ANON_KEY=... EXPO_PUBLIC_API_BASE_URL=http://localhost:3000 expo start
```
