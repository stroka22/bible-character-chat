# Bible Character Chat — Engineering Handoff

Last updated: ${DATE}

## 0) TL;DR for Next Engineer

- Live app: https://faithtalkai.com
- Repo: https://github.com/stroka22/bible-character-chat
- Local path (owner’s machine): `/Users/brian/bible-character-chat`
- Hosting: Vercel (Vite frontend + API routes)
- Backend: Supabase (Auth, Postgres, Realtime, Edge Functions)
- Payments: Stripe (Checkout + Billing Portal)

Immediate priority: finalize “Manage Subscription” (Stripe Billing Portal) via same‑origin API route `/api/create-billing-portal-session` which proxies to a Supabase Edge Function. See Section 7 (Runbook) and Section 8 (QA Checklist).

Do this first:
1. Verify Vercel env (server) and Supabase function env (Stripe + service keys).
2. Redeploy both with cache cleared on Vercel.
3. Test the API route directly (GET) to confirm 200 + `{ url }`.

---

## 1) Project Overview

Bible Character Chat is a multi‑tenant chat app that lets users talk with biblical characters. It supports free vs premium characters, org‑scoped settings, VIP (admin) premium overrides, invites, and admin tools. Most functionality is live; the remaining work is ensuring Billing Portal opens reliably so users can manage subscriptions.

Key goals achieved:
- Multi‑tenant org context and settings.
- Premium gating implemented consistently across selection and chat.
- VIP overrides propagate immediately, including UI labels.
- Stripe Checkout → post‑checkout → premium state refresh.
- “Manage Subscription” flows wired into the Header and Account page.

Open item:
- Billing Portal API returns 400 in production; see Runbook.

---

## 2) Stack & Interactions

- Frontend: React + Vite. App entry uses `App.tsx` (note: some production components use `.jsx` variants).
- Routing: React Router. `main.tsx` renders `App.tsx`.
- Backend: Supabase (Auth, Postgres, Realtime). Profile row drives `owner_slug` and `premium_override`.
- Edge Functions (Supabase):
  - `delete-user` — admin deletion with role checks + CORS.
  - `post-checkout-session` — links Stripe checkout session → profile.
  - `get-subscription` — returns active sub by `stripe_customer_id`.
  - `create-billing-portal-session` — creates Stripe Billing Portal sessions; now auto‑creates Stripe customer if missing.
- Payments: Stripe (Checkout + Billing Portal).
- Hosting/Proxy: Vercel (serves Vite build; provides same‑origin API routes that call Supabase Edge Functions to avoid browser CORS).

How it works for Billing Portal:
1) Frontend calls same‑origin `/api/create-billing-portal-session`.
2) Vercel API route (Edge runtime) calls Supabase Edge Function with `apikey` + `Authorization` headers.
3) Edge Function fetches/creates `stripe_customer_id`, creates Billing Portal session, returns `{ url }`.
4) Frontend redirects browser to Stripe.

---

## 3) Environments & Secrets

Never commit secrets. Populate in provider dashboards.

Client (Vercel Project Env, prefixed VITE_):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_STRIPE_PRICE_MONTHLY`
- `VITE_STRIPE_PRICE_YEARLY`
- `VITE_SUPABASE_PROJECT_REF` (optional helper)
- `VITE_OWNER_SLUG` (fallback; real source is profile)

Server (Vercel Project Env for API routes):
- `SUPABASE_URL` (same value as VITE_SUPABASE_URL)
- `SUPABASE_ANON_KEY` (same as VITE_SUPABASE_ANON_KEY)

Supabase Edge Function env (per function settings):
- `STRIPE_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Where:
- Vercel → Project → Settings → Environment Variables (Production)
- Supabase → Project → Edge Functions → Function → Settings → Environment Variables

Note: This document intentionally does not include any credential values. Retrieve them from provider dashboards or secret manager.

---

## 4) Code Map (Most Relevant Files)

Frontend routing & pages:
- `src/App.tsx` — main router; includes `/account` route.
- `src/pages/AccountBilling.jsx` — opens Billing Portal when `?open=1`; one‑shot session guard; calls `/api/create-billing-portal-session`.
- `src/pages/PricingPage.jsx` and `src/pages/PricingPage.js` — pricing and conditional “Manage Subscription”.
- `src/components/Header.jsx` — adds “Manage Subscription” entry linking to `/account?open=1`.

Gating & chat:
- `src/components/ScalableCharacterSelection.jsx` — production gating logic (effectiveOverride, fresh DB checks, label updates).
- `src/components/CharacterSelection.tsx` and `src/components/ScalableCharacterSelection.tsx` — TypeScript counterparts used earlier.
- `src/components/chat/ChatInterface.js` and `.tsx` — message limit honors `premium_override`.

Auth & org context:
- `src/contexts/AuthContext.tsx` — pulls profile (`owner_slug`, `premium_override`), persists `ownerSlug`, subscribes Realtime updates, auto‑redeems invites.

Stripe helpers:
- `src/services/stripe-safe.js` — `openBillingPortal` uses same‑origin API route; checkout helpers.

Vercel API routes:
- `api/create-billing-portal-session.js` — Edge runtime; POST/GET support; resilient body parsing; bubbles upstream errors.

Supabase Edge Functions:
- `supabase/functions/create-billing-portal-session/index.ts` — creates Billing Portal session; auto‑creates customer if missing; broad CORS allow headers.
- `supabase/functions/delete-user/index.ts` — admin deletion + CORS.
- `supabase/functions/get-subscription/index.ts` — reads active subscription.
- `supabase/functions/post-checkout-session/index.ts` — links checkout session to profile.

Other infra:
- `vercel.json` — Vercel rewrites and caching.
- `src/repositories/siteSettingsRepository.js` — uses `.maybeSingle()` to avoid 406.

---

## 5) Features (by Role)

User:
- Browse and chat with characters; free vs premium gating enforced.
- Premium via Stripe Checkout; post‑checkout polling/refresh updates premium state.
- If VIP (admin toggled `premium_override`), premium features are immediately available and UI labels show “Chat”.
- Manage Subscription via Header → “Manage Subscription” or `/account?open=1`.

Admin:
- Invite management (unlimited + higher cap options); shareable links.
- Accept invite flow: `/invite/:code` with auto‑redeem and post‑login handling.
- Premium override toggle per user; analytics for premium customers.
- Delete user (role‑guarded; edge function with CORS).

Superadmin:
- All admin features; additional superadmin guard rails where implemented.

System behaviors:
- Org context derives from `profile.owner_slug` (persist/broadcast to `localStorage` + `ownerSlugChanged`).
- Premium gating checks `isPremium || !!profile.premium_override`.
- Fresh DB checks in selection and grid card callbacks ensure immediate effect after override.
- `effectiveOverride` state forces UI to show “Chat” promptly.

---

## 6) Current Status & Known Issues

Status: All gating/override flows are live and working in production. UI labels and selection logic are aligned. Admin tools are functioning.

Known issue: Billing Portal opening via `/api/create-billing-portal-session` returns HTTP 400 in production. We added:
- Rich error surfacing in API route.
- Edge Function auto‑creates `stripe_customer_id` if missing.
- One‑shot guard on `/account?open=1` to prevent loops and strip the query.

Likely causes to validate: Vercel env for API route, Supabase edge function deployment/env, cache.

---

## 7) Billing Portal Runbook (Fix & Verify)

1) Verify environments
- Vercel Project Env (server side): `SUPABASE_URL`, `SUPABASE_ANON_KEY` present & correct.
- Vercel Project Env (client side): all `VITE_*` keys present.
- Supabase Edge Function env (`create-billing-portal-session`): `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` set.

2) Deploy
- Supabase: `npx supabase functions deploy create-billing-portal-session --project-ref <PROJECT_REF>`
- Vercel: Redeploy latest with “Clear cache” enabled.

3) Browser hygiene
- DevTools → Application → Service Workers → Unregister.
- Application → Clear storage → Clear site data.
- Network → No throttling; ensure “Offline” not selected.
- Prefer Incognito (avoid extensions that inject `intercept.js`).

4) Test API route directly (GET to avoid body parsing issues)
```js
const uid = window.__auth?.user?.id;
fetch(`/api/create-billing-portal-session?userId=${encodeURIComponent(uid)}&returnUrl=${encodeURIComponent(location.origin + '/account')}`)
  .then(async r => { const t = await r.text(); console.log('STATUS:', r.status); console.log('RAW:', t); try { console.log('JSON:', JSON.parse(t)); } catch {} });
```
Expected: `STATUS: 200` and JSON with `{ url: 'https://billing.stripe.com/...' }`.

5) Test UI flows
- Header → Manage Subscription → should navigate to `/account?open=1`, strip query, and redirect to Stripe.
- Pricing page should show “Manage Subscription” when user has `stripe_customer_id`, `isPremium`, or `premium_override`.

---

## 8) QA Checklist

Premium override (admin toggled):
- Premium character selection shows “Chat” and opens without upgrade modal.
- Chat message cap doesn’t trigger upgrade modal.

Non‑premium user:
- Premium characters show “Upgrade to Chat”.
- Free characters show “Chat” and work.

Checkout → Premium:
- After Stripe checkout, `stripe_customer_id` is linked.
- `usePremium` polling/refresh updates isPremium.
- “Manage Subscription” appears.

Billing Portal:
- `/account?open=1` opens portal once per session (no loops) and returns to `/account`.

Invites:
- Admin creates invite. User accepts on `/invite/:code`. If not signed in, code is stored and redeemed post‑login.

Delete user:
- Works for admin. Confirm CORS and role checks.

Site settings:
- No 406s during `site_settings` queries.

---

## 9) Local Development

Install & run:
- `npm ci`
- `npm run dev`
- `npm run build`

Edge functions:
- `npx supabase functions deploy <name> --project-ref <PROJECT_REF>`

Note: Production may import `.jsx` files over `.tsx` in a few places. Confirm imports match the files you update.

---

## 10) Future Improvements

- Video/audio conversations (Zoom‑like) with characters.
- Deep research tools (citations, historical context exploration, study modes).
- Multilingual support (models + UI).
- Payments for pastors/admins (subscriptions, revenue share, donations).
- Observability (Sentry, structured logs), performance tuning, service worker cache strategy.
- Rate limiting and hardening of API routes/functions.

---

## 11) Change History (Highlights)

- Fixed org context: use `profile.owner_slug` (not env) and persist/broadcast.
- Premium gating: consistent across components; message caps respect override.
- UI label fixes via `effectiveOverride` and fresh DB checks.
- Edge Functions: added CORS, added post‑checkout, subscription fetch, delete user.
- Billing Portal: added same‑origin API route, enriched errors, auto‑create customer in function.
- Avoided 406 by using `.maybeSingle()` in `siteSettingsRepository.js`.

---

## 12) Contacts & Admin

- Vercel: project hosting and environment variables.
- Supabase: database, auth, edge functions, service role.
- Stripe: product prices, checkout, billing portal.

All secrets live in provider dashboards – do not commit to the repo. Ensure production deploys are done with Vercel “Clear cache.”
