# Bible Character Chat – Project README

## 1 · Current Project Status
The project exists in **two fully functional editions**:

| Edition | Purpose | Compile Step | Current Health |
|---------|---------|--------------|----------------|
| **Standalone (HTML + JS)** | Rapid demo / no tool-chain required | none | **Stable** – loads instantly, all core features (selection, chat, insights) work |
| **React / Vite App** | Long-term maintainable codebase | `npm run dev` or `start-app.sh` | **Needs TypeScript fixes** – UI builds but hits compile errors; service-worker & redirect issues mostly resolved |

Key takeaway: **use the standalone build for demos or user testing** while React bugs are being closed.

---

## 2 · Getting Started

### Prerequisites
* Node ≥ 18 & npm (for React edition)
* Python 3 (only if you use the provided simple HTTP server)
* Bash (for helper scripts)
* No database or API keys are required in demo mode; OpenAI / Stripe are stubbed when env vars are missing.

### Quick Start (Standalone)
```bash
# from repo root
bash restart-server.sh         # kills old :8001 server and serves /public
# then open
http://localhost:8001/public/standalone-chat-improved.html
```

### Quick Start (React)
```bash
cp .env.example .env           # add your keys or leave placeholders
npm i
npm run dev                    # default vite port 5173
# or
bash start-app.sh --skip-auth --force-react --port 5175
```

Use `VITE_SKIP_AUTH=true` to bypass Supabase login during dev.

---

## 3 · File Guide

### Core UI
* `public/standalone-chat-improved.html` – one-page fully working app; authoritative reference for layout & behaviour.
* `public/character-fix.js` – runtime logic for character rendering, filtering, chat, insights (loaded by standalone).
* `src/components/ScalableCharacterSelection.tsx` – React counterpart of the selector.
* `src/contexts/ChatContext.tsx` & `AuthContext.tsx` – state & session logic.

### Build / Serve Scripts
* `restart-server.sh` – kills anything on port 8001 and serves repo over Python http.server.
* `start-app.sh` – wrapper around `vite` + env flags (`--skip-auth`, `--force-react`, `--port`).
* `react-server.mjs` – alternative Node server that forces React index over rogue HTML files.

### Utilities & Fixes
* `public/service-worker-cleanup.js` – nukes old PWA caches that caused redirect loops.
* `public/intercept.js` – network interceptor; localhost allow-list fixes earlier blocking bug.
* `database_schema.md` – Supabase / Postgres schema & import notes.

---

## 4 · Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Blank white page, no console errors | Service-worker cached old build | Run `service-worker-cleanup.js` by refreshing app (React) or clear browser storage. |
| Character grid shows raw JSON/text | `character-fix.js` failed to load | Check browser console.<br>1. Confirm file served (Network tab 200).<br>2. Verify correct `<script src="character-fix.js">` path in HTML. |
| “Address already in use” on port 8001 | Old http.server still running | `bash restart-server.sh` or `lsof -ti:8001 | xargs kill -9`. |
| React build fails with TypeScript errors | Legacy code still referencing old column names | Run `npm run lint`, fix imports: use `name`, `description`, `openingLine` not snake_case. |
| Redirect to old character page | Cached service-worker or `intercept.js` domain list | Ensure `intercept.js` doesn’t block localhost, clear caches, restart dev server with `--force-react`. |

---

## 5 · Quick Reference for Future Development

### Character Data
* Standalone keeps sample characters in `character-fix.js` (`window.characters` array).
* React fetches from Supabase `characters` table (see `database_schema.md`).
* To add a new character in standalone: append object to `window.characters` before `initializeCharacterSelection()` call.
* In DB flow: `insert into public.characters (…) values (…)` then refresh app.

### Environment Flags
| Flag | Effect |
|------|--------|
| `VITE_SKIP_AUTH=true` | bypass login / Supabase |
| `DIRECT_RENDER=true`  | render `ScalableCharacterSelection` directly (debug) |
| `STRIPE_DISABLED=true`| stub Stripe in dev |
| `FORCE_REACT=true`    | react-server always serves index.html |

### NPM Scripts
```json
"dev":   "vite --strictPort",
"build": "tsc && vite build",
"preview": "vite preview"
```

### Coding Conventions
* **Images** – use table-based markup with fixed width/height for perfect circles across browsers.
* **Field names** – camelCase throughout React (`name`, `description`, `openingLine`).
* **Service worker** – keep disabled in dev via `vite.config.ts` `build: { brotliSize:false }` and no register call.

### Roadmap
1. Fix remaining React TypeScript errors & integrate `character-fix` logic.
2. Replace alert stubs with real AI chat (`src/services/openai.ts`) once keys available.
3. Finish pastor/admin dashboards & subscription gating via Stripe.
4. Convert standalone CSS into Tailwind modules for React parity.
5. Write Cypress tests for selector, chat flow, and insights collapsibles.

---

Happy coding & may your build be blessed!
