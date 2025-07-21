# NEXT_SESSION_HANDOFF.md  
Bible Character Chat – Seamless Transition Guide  
_Last updated: July 2025_

---

## 1 ▪ Project Overview & Current Status
Bible Character Chat is a React + Vite web app that lets users converse with biblical figures, view contextual “Insights”, and (optionally) subscribe via Stripe.  
All core screens build, the server runs on **http://localhost:5186**, and three demo characters (“Jesus (Final)”, “Paul (Final)”, “Moses (Final)”) are visible with working images.

Recent milestones  
• Fixed navigation, pricing, chat UI and image issues  
• Implemented robust chat engine with GPT-4 or mock fallback  
• Added localStorage offline mode for chats when Supabase fails  
• All builds succeed with Vite 6.3.5

---

## 2 ▪ Repository Structure & Key Files
```
/src
  ├─ components/          UI atoms/molecules (Header, ChatBubble, InsightsPanel…)
  ├─ contexts/
  │   └─ ChatContext.js   ← main chat state, retry logic
  ├─ pages/               Home, Pricing, AdminPanel…
  ├─ repositories/
  │   ├─ characterRepository.js
  │   ├─ chatRepository.js        ← Supabase + fallback
  │   └─ mockChatRepository.js    ← localStorage implementation
  ├─ services/
  │   ├─ openai.js                ← GPT-4 + mock fallback
  │   └─ mockResponseService.js   ← generates / streams mock replies
  └─ data/mockResponses.json      ← canned answers for offline mode
/scripts                        Utility CLI scripts
/dist                           Production build (served by Vite preview)
run-app.sh                      One-liner build + launch
.env                            Environment variables (safe keys only)
```
Full docs live in root:
- HANDOFF_FINAL.md, FINAL_SOLUTIONS.md, CHAT_FIXES.md, DESIGN_SYSTEM.md, CSV_IMPORT_GUIDE.md, UPDATED_CSV_STRUCTURE.md

---

## 3 ▪ Database Configuration (Supabase)
Project URL : `https://sihfbzltlhkerkxozadt.supabase.co`  
Anon key : stored in `.env` as `VITE_SUPABASE_ANON_KEY`

Main tables  
| Table | Purpose | Notes |
|-------|---------|-------|
| `characters` | Character metadata & images | Column `is_visible` controls listing |
| `chats` | One row per user↔character conversation | RLS currently permissive for demo |
| `chat_messages` | Messages within a chat | FK `chat_id` |
| `character_groups` | Tagging/relationship info | Optional |

Known DB issue: `INSERT INTO chats` can return **409** if RLS or uniqueness mis-matched. chatRepository now auto-switches to localStorage on such errors.

---

## 4 ▪ Chat System Architecture & Recent Fixes
1. **ChatContext** orchestrates message flow, typing indicator, retry.  
2. **chatRepository** talks to Supabase; on 403/409/23505 activates **mockChatRepository**.  
3. **openai.js** streams GPT-4; if key missing or request fails uses **mockResponseService**.  
4. **mockResponseService** pulls from `mockResponses.json`, analyses user text, streams paragraph-by-paragraph.  
5. All failures degrade gracefully, so UX never shows blank states.

---

## 5 ▪ Environment Variables
`.env` already contains working public keys. Add/replace as needed:

```
VITE_SUPABASE_URL=…
VITE_SUPABASE_ANON_KEY=…
VITE_OPENAI_API_KEY=sk-...      # optional – omit to use mock mode
VITE_STRIPE_PUBLIC_KEY=pk_test_…
VITE_STRIPE_PRICE_MONTHLY=price_…
VITE_STRIPE_PRICE_YEARLY=price_…
```

---

## 6 ▪ Working Characters & Demo Data
Script `scripts/create_working_characters.js` inserts/updates:
- **Jesus (Final)**
- **Paul (Final)**
- **Moses (Final)**  
Each includes persona, opening line, insights data, Unsplash avatar & feature images (300 × 300 & 1000 × 560).

CSV samples:  
`complete_characters.csv`, `sample_groups.csv`, plus import guide.

---

## 7 ▪ Scripts & Tools
| Script | Purpose |
|--------|---------|
| `run-app.sh` | Build, kill old preview, start new server on 5186 & open browser |
| `generate_mock_responses.js` | Produce /src/data/mockResponses.json |
| `create_working_characters.js` | Ensure demo characters visible with images |
| `debug_chat_system.js` | CLI test for mock response engine |
| `check_characters.js` | Diagnose character visibility / schema |
| `query_db_structure.js` | Prints Supabase table & column info |

_All scripts runnable via `node <script>` from project root._

---

## 8 bis ▪ Planned Feature Enhancements
The following feature ideas have been captured during discussion but are **not yet implemented**.  Each item includes a short description and any initial notes so the next Droid can evaluate scope and priority.

1. **Video & Audio Conversations**  
   • Allow users to converse with characters via recorded voice / video snippets.  
   • Requires WebRTC (or third-party SDK), media storage (Supabase Storage or S3), and optional speech-to-text for transcripts.  
   • No code started – only feasibility noted.

2. **Bible Study Plans with Character Guidance**  
   • Users pick a character; the system suggests a multi-day reading/discussion plan.  
   • Plan objects could live in a new `study_plans` table; chat prompts auto-generated each day.  
   • Pending schema design.

3. **Editable Free / Premium Parameters**  
   • Admin UI to change message limits, feature toggles, pricing tiers without redeploying.  
   • Could store in Supabase table `app_config` and cache in React context.  
   • Stripe checkout flow already stubbed – this would integrate with it.

4. **Comprehensive Responsiveness**  
   • Audit every screen (Home, Chat, Pricing, Admin) for breakpoints down to 320 px.  
   • Add unit tests with `jest-playwright` for Chrome, Safari, Firefox; include mobile emulation.  
   • Header & chat UI mostly responsive but needs QA.

5. **Group Chats (Multiple Characters)**  
   • User can invite >1 character into a single conversation – assistant persona becomes a multi-agent orchestrator.  
   • Feasibility document exists (see `HANDOFF_FINAL.md`).  No schema changes yet.

6. **Gamification System**  
   • Earn points/badges for streaks, completing study plans, or discovering new insights.  
   • Proposed tables: `user_rewards`, `badges`.  Needs UX design.

7. **Multi-Language Support**  
   • Allow users to chat and navigate the UI in multiple languages (e.g., Spanish, French, Portuguese).  
   • Requires i18n library on the front-end (react-i18next or similar) plus locale JSON files.  
   • Chat engine: detect user language, translate prompts/responses or request specific language from GPT/mock engine.  
   • Database: store localized character content or translate on-the-fly; consider `language` column in `characters` and `chat_messages`.  
   • Admin panel needs language switch & content management for translations.  

8. **Additional Ideas**  
   • Dark-mode toggle tied to OS preference  
   • Push-notifications for study plan reminders  
   • Public share link for specific chat excerpts

---

## 8 ▪ Outstanding Issues & Next Steps
1. **Supabase RLS** – tighten policies, re-enable server-side auth, drop anon writes.  
2. **Sync Offline → Online** – when connection returns, push localStorage chats to Supabase.  
3. **Bundle Size** – Vite warns >500 kB; consider code-split & lazy JSON import.  
4. **Stripe Checkout** – front-end ready; needs Edge Function / webhook for subscription activation.  
5. **Group Chat** – multi-character conversations scoped out; feasibility doc exists.  
6. **Accessibility & SEO** – conduct full WCAG 2.2 audit and add meta/OG tags for sharing.  
7. **Tests & Monitoring** – integrate Jest + React-Testing-Library; add Sentry / Supabase Edge logs.

---

## 9 ▪ Quick-Start for Next Droid
```bash
# 1. Install deps (first run)
npm install

# 2. Provide env overrides if needed
cp .env.example .env   # or edit existing

# 3. Build & launch
./run-app.sh           # => http://localhost:5186
```
Login/signup is optional (auth disabled in `.env` via `VITE_SKIP_AUTH=true`).  
Open Home → choose a character → chat streams responses (GPT-4 if key, mock if not).

---

### Need Help?
• **Docs first** – HANDOFF_FINAL.md & FINAL_SOLUTIONS.md explain design & fixes in depth.  
• **Dev console** – extensive console warnings guide you if fallback modes trigger.  
• **Scripts** – run diagnostics in `/scripts` to validate DB, images and chat engine.

Happy building!  
_— Previous Droid_ 🚀
