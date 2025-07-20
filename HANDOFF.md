# Bible Character Chat – Handoff Document

---

## 1. Project Overview
Bible Character Chat is a React + Vite web application that lets users converse with Biblical figures via an OpenAI-powered chat engine.  It offers a freemium model (limited free chat vs. premium subscription), admin tools for managing characters/groups via CSV import, and a Stripe checkout flow for paid plans.

---

## 2. Current Status
| Area | Status | Notes |
| ---- | ------ | ----- |
| Build / CI | ✅ builds via `npm run build` |
| Routing & Navigation | ✅ header shows Home, Pricing, Admin (if admin), My Chats, Upgrade |
| Chat Engine | ✅ messages, typing indicator, insights side-panel |
| Auth (Supabase) | ✅ login/signup, ProtectedRoute works<br>🔧 `VITE_SKIP_AUTH=true` in `.env` (dev only) |
| Payments | ⚠️ Stripe keys & price IDs required; checkout tested in **test** mode only |
| Admin CSV upload | ✅ working (Admin → Bulk Upload) |
| UI polish | 🔧 needs cross-browser QA; some responsive edge-cases |
| Unit / E2E tests | 🚫 none |

---

## 3. Application Structure
```
src/
 ├─ App.js               // routing, providers, header
 ├─ contexts/            // AuthContext, ChatContext
 ├─ pages/               // Home, Pricing, Admin, Login, Signup, Conversations
 ├─ components/
 │   ├─ layout/Header.js // top navigation
 │   ├─ chat/            // ChatBubble, ChatInput, ChatInterface, InsightsPanel
 │   └─ ...
 ├─ repositories/        // character & group, include mock fallbacks
 ├─ services/            // openai.js, stripe.js, supabase.js
 └─ data/                // mockCharacters.js, mockGroups.js
```
Primary data flow:  
UI ➜ ChatContext ➜ openai service ➜ update messages ➜ ChatInterface renders.

---

## 4. User Flows
1. **Free visitor**
   1. Land on `/` → select a character → free chat (5-message limit enforced in ChatContext).
   2. Attempt to exceed limit → redirected to `/pricing`.

2. **Signup / Login**
   1. `/signup` or `/login` → Supabase auth → returns to last page.

3. **Upgrade to Premium**
   1. Click *UPGRADE* (header or pricing CTA) → `/pricing`.
   2. Choose Monthly/Yearly → Stripe Checkout → on success `/conversations?checkout=success`.

4. **Admin**
   1. Admin role → `/admin` (ProtectedRoute)  
   2. Bulk CSV upload, edit characters/groups.

---

## 5. Implemented Features
- Responsive UI with glass-morphism aesthetic matching `chat-with-insights-mockup.html`.
- Free-tier badge + limited chat enforcement.
- Insights side-panel with collapsible sections (historical context, scripture refs, etc.).
- Breadcrumb & share button inside chat header.
- Stripe test-mode checkout (+ config tester).
- CSV bulk import with client-side parse & Supabase insert/update.
- Mock repositories when Supabase offline (development-friendly).
- Debug panel (`/debug`) for environment checks.

---

## 6. Implementation Details
- **Frameworks:** React 18, Vite, Tailwind (via CDN + utility classes), Framer-Motion for panel animation.
- **Auth:** Supabase JS v2; AuthContext wraps app, `useAuth` exposes helpers.
- **Chat:** OpenAI `gpt-4o` (config in `openai.js`). Streaming not yet implemented.
- **Payments:** Stripe.js loaded with `loadStripe(getPublicKey())`; serverless edge function endpoint derived from `.env`.
- **State:** ChatContext stores current character, messages, typing state.
- **Styling:** Mostly Tailwind classes; global tweaks in `src/App.css`.

---

## 7. Known Issues / Technical Debt
1. No automated tests.
2. Stripe live keys not configured—needs production edge function.
3. Character limit (5 messages) hard-coded.
4. Mobile chat container overflow on very small screens (<360 px).
5. Header collapses poorly when long user email is shown.
6. Lacks accessibility audit (contrast, aria labels).
7. Build size >500 kB; code-splitting TBD.

---

## 8. Future Work
- Add message streaming & abort controller for faster UX.
- Implement global rate-limit & quota tracking.
- Build conversation history viewer with filter/search.
- Internationalisation (i18n) stub exists but not wired.
- Add role-based admin UI (pastor vs. super-admin).
- Integrate telemetry (PostHog or Plausible) per privacy policy.
- Replace Tailwind CDN with PostCSS pipeline.
- Write Cypress E2E for signup → checkout → chat flow.
- Optimize chunking; lazy-load admin & pricing routes.

---

## 9. Environment Setup
```bash
git clone git@github.com:YOUR_ORG/bible-character-chat.git
cd bible-character-chat
pnpm i          # or npm install
cp .env.example .env  # fill values below
```
Required `.env` keys:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENAI_API_KEY=
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_YEARLY=price_...
VITE_SUPABASE_PROJECT_REF=<ref>
```
Optional (dev):
```
VITE_SKIP_AUTH=true
```
Run dev server:
```bash
npm run dev          # vite dev, default port 5173
```

---

## 10. Deployment
1. **Build**
   ```bash
   npm run build      # outputs dist/
   ```
2. **Preview locally**
   ```bash
   npm run preview -- --port 5180
   ```
3. **Static hosting**
   - Upload `dist/` to Netlify/Vercel/static S3 bucket.
   - Ensure `/*` → `/index.html` rewrite rule.
4. **Supabase Edge Functions**
   - Deploy `create-checkout-session` & `get-subscription` to match Stripe code.
5. **Env on host**
   - Add the same `.env` vars as above (prefix with `VITE_` for Netlify).

---

## 11. Contact Information
| Role | Name | Slack / Email |
| ---- | ---- | ------------- |
| Product Owner | Brian A. | @brian / brian@example.com |
| Tech Lead | *vacant* | — |
| Design Reference | `chat-with-insights-mockup.html` in repo |

For onboarding help, DM Brian or open issues in the GitHub repo.

---
