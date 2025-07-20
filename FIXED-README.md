# Bible Character Chat – Fixed Edition

Welcome to the **Fixed Edition** of the Bible Character Chat project.  
This README explains the changes that eliminated the persistent redirect/blank-screen problem, how to launch the app in different modes, and where to look if something still goes wrong.

---

## 1. What Was Fixed (and Why)

| Area | Symptom Before | Fix Implemented |
|------|----------------|-----------------|
| Network interceptor | Localhost ports were on the block-list, causing the browser to abort requests and fall back to cached pages that redirected elsewhere. | `public/intercept.js` was trimmed to block only `example.com` domains. Local development ports (5173-5177, 3000) are now allowed. |
| Orphaned service-workers | Old SWs silently intercepted every request and redirected to a stale cache. | New script `public/service-worker-cleanup.js` unregisters all service-workers and clears caches at page load. |
| Vite dev server | When port 5173 was taken Vite auto-incremented, so existing SWs kept hijacking. | `vite.config.ts` now uses `strictPort: true`; the dev server fails fast if 5173 is occupied, prompting you to free the port.  No silent port hops, no phantom redirects. |
| Cache headers | Browser sometimes served outdated bundles. | Dev server now sets `Cache-Control: no-store`.  The bypass server (`server.mjs`) also disables caching. |
| App bootstrap | Errors during `createRoot` were swallowed by redirects. | `src/main.tsx` adds early SW cleanup, safe network interceptor injection and a visible red error banner if React fails. |
| Router loops | React Router occasionally redirected to `/`, masking errors. | `src/App.tsx` adds debug banners, a `?direct=1` mode that bypasses routing, and a `*` route that gracefully returns home without hard reloads. |
| Launch friction | Starting the app required remembering ports, .env setup, dependency install, etc. | **`launch-react-app.sh`** script automates ① port cleanup ② .env creation/check ③ dependency install ④ running Vite. |

---

## 2. Quick-Start

### A. Launch the React app (recommended)

1. `cd bible-character-chat`
2. `./start-app.sh`  
   • Default port: **3000**  
   • Bypass login for quick testing: `./start-app.sh --skip-auth`  
   • Custom port example: `./start-app.sh --port=5173`

The script will:

* Kill any process on the chosen port
* Ensure `.env` exists (creates a minimal one if necessary)
* Install dependencies if `node_modules` is missing/out-of-date
* Build the React bundle (if needed)
* Start **`react-server.mjs`** which serves the built app with the correct
  cache-busting headers and automatically removes rogue service-workers

Open `http://localhost:3000` in your browser.  
If you see a red **DIRECT / SKIP_AUTH** banner you are in a special debug mode (see below).

### B. Run the standalone HTML build

This mode bypasses React completely and serves pre-built HTML/JS from `public/`.

1. `node server.mjs`
2. Visit `http://localhost:4000` (or whatever port you configured)

Use this if the React build is broken and you need a guaranteed working UI.

---

## 3. Runtime Options & Flags

| Flag | How to set | Effect |
|------|-----------|--------|
| `DIRECT_RENDER` | `.env` or `?direct=1` query string | Renders the character selector directly, skipping React Router – helpful when investigating route loops. |
| `SKIP_AUTH` | `.env` or `?skipAuth=1` | Bypass Supabase auth wrappers so the app loads even if auth is mis-configured. |
| `VITE_ENABLE_INTERCEPTOR=false` | `.env` | Prevents `intercept.js` from loading (useful when debugging third-party asset loading). |
| `VITE_AUTH_DEBUG=true` | `.env` | Enables verbose auth console logs. |

---

## 4. Troubleshooting Guide

1. **Blank page after refresh**  
   *Press F12 → Network tab* – If you see requests blocked by `intercept.js`, set `VITE_ENABLE_INTERCEPTOR=false` or ensure the URL is not in the block-list.

2. **Spinning loader never ends**  
   • Check console for `"ScalableCharacterSelection MODULE LOADED"` – if absent, React bundle did not load.  
   • Make sure service-workers are gone (reload with _Disable cache_ + _Hard Reload_).

3. **Port already in use**  
   • `launch-react-app.sh` frees it automatically.  
   • Manual: `lsof -i :5173` then `kill -9 <PID>`.

4. **API-key / env errors**  
   • Verify `.env` contains keys for `VITE_OPENAI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.  
   • Missing keys are handled gracefully, but chat will show placeholder text.

5. **Still redirecting to a strange page**  
   • Clear **Application › Service Workers** and **Application › Clear Storage** in DevTools then reload.  
   • Run standalone mode (`node server.mjs`) to rule out React build issues.

---

## 5. Project Structure (High-level)

```
bible-character-chat/
│
├── start-app.sh                 → Build + launch everything with one command
├── react-server.mjs             → Dedicated server for the built React SPA
├── server.mjs                   → Simple Node server for standalone HTML
├── vite.config.ts               → Vite dev/build settings (strictPort, no-cache)
│
├── public/                      → Static assets
│   ├── complete-app.html        → Integrated selector + chat demo
│   ├── bible-characters.html    → Reliable selector-only fallback
│   ├── intercept.js             → Network request interceptor (images only)
│   └── service-worker-cleanup.js→ Kills rogue service-workers & caches
│
├── src/                         → React application
│   ├── App.tsx                  → Top-level router / flags / error boundary
│   ├── main.tsx                 → Bootstraps SW cleanup, interceptor, React root
│   │
│   ├── components/
│   │   ├── ScalableCharacterSelection.tsx → Feature-rich selector UI
│   │   ├── chat/…                → Chat bubbles, input, insights panel
│   │   └── layout/…              → Header, Footer, DebugPanel
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx       → Supabase auth & role helper
│   │   └── ChatContext.tsx       → Selected character & conversation state
│   │
│   ├── services/
│   │   ├── openai.ts             → Safe OpenAI wrapper (handles missing key)
│   │   ├── stripe.ts             → Safe Stripe wrapper
│   │   └── supabase.ts           → Supabase client initialisation
│   │
│   └── pages/                    → Routed pages (Login, Pricing, Admin…)
│
└── database_schema.md            → Full characters table spec & migration SQL
```

**How it fits together**

1. `ScalableCharacterSelection` queries `characterRepository` → Supabase → `characters` table.  
2. Clicking a card updates `ChatContext` which opens the chat interface.  
3. `openai.ts` generates/streams responses using the chosen character’s `persona_prompt`.  
4. Admin & Pastor pages live under `pages/` and share auth guards from `AuthContext`.  
5. Standalone HTML files in `public/` leverage the same CSS and safe service shims but bypass React for maximum reliability.

---

### Enjoy building with a clean slate!

If you encounter any problems not covered here, open the DevTools console, copy any error messages, and share them when asking for help. Together we’ll keep the app shining brighter than a thousand Sunday-school flannelgraphs. 🙏
