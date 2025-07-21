# Bible Character Chat – Solutions README

Welcome!  
This document records the journey of stabilising **Bible Character Chat** during July 2025, summarising what was broken, how we fixed it, the alternative work-arounds we produced, and what still needs attention.

---

## 1. Problems We Encountered & Fixed

| Area | Symptoms | Root Cause | Status |
|------|----------|-----------|--------|
| React app showed blank white screen | Vite crashed during boot | Missing env vars → OpenAI / Stripe initialisation failures | **Fixed** – graceful fallbacks & placeholder vars |
| Wrong data in character cards | `name`, `description`, `opening_line` mismatches | DB column names `character_name`, `short_biography`, `opening_sentence` | **Fixed** – refactored React components |
| Admin features unavailable | Supabase RLS forced anonymous role | Added `refreshSession()` & SQL policy patch | **Fixed** |
| Images appeared oval not circular | flex/ratio differences across browsers | Re-implemented with table-based layout | **Fixed** |
| Localhost kept redirecting to legacy HTML | `public/intercept.js` & rogue service worker | Whitelisted localhost, added cleanup script | **Fixed (dev)** but see troubleshooting |
| Clicking a character only showed `alert()` | Stand-alone file `bible-characters.html` was being served | Removed alert, built full chat HTML | **Fixed** in *standalone-chat.html* |
| React build fails (TypeScript) | Non-ASCII quotes & stray tokens | Needs clean-up | **Pending** |

---

## 2. Approaches We Tried

1. **Direct React fixes** – attempted to patch every error in situ.
2. **Emergency static pages** – produced minimal HTML files to isolate CSS / image problems.
3. **Service-worker purge & custom dev server** – `react-server.mjs` with `FORCE_REACT` flag.
4. **Node bypass server** – served /dist without Vite during debugging.
5. **Fully stand-alone SPA (vanilla JS)** – *standalone-chat.html* now provides all core features without a build step.

---

## 3. Stand-Alone Solutions

| File | Purpose | Key Features |
|------|---------|--------------|
| `public/bible-characters.html` | Original mock-up (legacy) | Static cards – **deprecated** |
| `public/characters.html` | Image rendering test | Table circles, filters |
| `public/ultra-simple.html` | Guaranteed card + chat stub | For lowest-risk demos |
| `public/standalone-chat.html` | **Current reference implementation** | Selection grid/list, filters, chat, insights, scripture links, relationships, study questions |
| `public/service-worker-cleanup.js` | Removes old SW caches | Prevents redirect loops |

---

## 4. How to Run Each Solution

### A. One-file Demo (no tooling)

```bash
# from repo root
open public/standalone-chat.html   # macOS
# or
start public\standalone-chat.html  # Windows
```

Works entirely client-side; no build, no backend.

### B. Static HTTP server (test multiple devices)

```bash
# Python 3
python3 -m http.server 8000
# visit http://localhost:8000/public/standalone-chat.html
```

### C. React Dev / Experimental

```bash
# Install deps once
npm install
# Skip auth & force React (may still fail until TS errors cleared)
./start-app.sh --skip-auth --force-react --port=5175
```

---

## 5. Troubleshooting Guide

| Issue | Fix |
|-------|-----|
| Still redirected to unknown origin | Open DevTools → Application → Service Workers → unregister all, then refresh. |
| Blank page & console shows OpenAI error | Ensure `VITE_OPENAI_API_KEY` exists or set `VITE_OPENAI_API_KEY=dummy`. |
| Port already in use | `./start-app.sh` will attempt to free it. Otherwise run `lsof -i :PORT`. |
| Images oval again | Make sure you are opening a *table-based* file (`standalone-chat.html`). |
| React `tsc` errors | Run `npm run lint` and replace curly quotes / stray JSX. See *Next Steps*. |

---

## 6. Next Steps

1. **Clean TypeScript sources**  
   ‑ Replace typographic quotes, fix misplaced JSX so `npm run build` succeeds.

2. **Merge stand-alone logic into React**  
   ‑ Port `standalone-chat.html` UI into `ScalableCharacterSelection.tsx`, `ChatPage.tsx`.

3. **Consolidate service-worker strategy**  
   ‑ Remove legacy workers in production; only register one Vite SW.

4. **Complete subscription features**  
   ‑ Wire Stripe mocks to real endpoints once keys added.

5. **Pastor/Admin dashboards**  
   ‑ Finish `AdminAccessPage.tsx` & role gating.

6. **Automated tests**  
   ‑ Add Playwright smoke test: select character → send message → receive response.

---

### Contact

For any blockers share console logs or screenshots in Slack #bible-chat-dev. Happy coding! 🙏
