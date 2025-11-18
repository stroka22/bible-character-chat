# Bible Character Chat — Engineering Handoff

This document is the authoritative guide for continuing development and operations of Bible Character Chat. It covers the architecture, environments, secrets locations, current features, open issues, validation runbooks, and future roadmap. It avoids including any raw secrets; instead it points to where they are stored.

If any section appears stale, prefer the repository code as the single source of truth and update this handoff accordingly.

---

## 1) Repositories and Code Map

- GitHub: https://github.com/stroka22/bible-character-chat
- Local path (on B MS’s machine): `/Users/brian/bible-character-chat`
- Key directories/files:
  - Frontend & API routes (Vercel):
    - `src/**` React app and services
    - `api/create-billing-portal-session.js` (proxy to Supabase Edge Function)
    - `api/leads.mjs` (lead capture + support email)
    - `api/_utils/email.mjs` (Resend integration)
    - `api/email-test.mjs` (debuggable email test endpoint; supports `?debug=1`)
  - Supabase Edge Functions:
    - `supabase/functions/create-billing-portal-session/index.ts`
    - `supabase/functions/handle-stripe-webhook/index.ts`
    - `supabase/functions/handle-stripe-webhook/supabase.toml` (`verify_jwt=false`)
  - Stripe client utilities:
    - `src/services/stripe.ts`
  - Project configuration:
    - `package.json`, `vite.config.*`, `tailwind*`, etc.

---

## 2) Platforms and How They Interact

- Vercel: Hosts React build and Serverless API routes in `/api/*`.
- Supabase: Postgres + Auth + Edge Functions. Edge Functions handle Stripe portal session creation and webhooks.
- Stripe: Checkout/Portal/Webhooks for subscriptions; customer mapping to `profiles.stripe_customer_id`.
- Resend: Transactional email (support notifications and test sends). Google Workspace hosts the human mailbox.

Data flow highlights:
- App → Vercel API `/api/create-billing-portal-session` → Supabase Edge Function → Stripe Billing Portal session URL → frontend redirect.
- Stripe Webhooks → Supabase Edge Function `handle-stripe-webhook` → updates `profiles` and `subscriptions`.
- Lead submit → Vercel API `/api/leads` → insert into `leads` → trigger `sendSupportLeadNotification` via Resend.

---

## 3) Environments and Secrets (Locations)

Do not paste secrets into chat or code.

- Vercel (Project → Settings → Environment Variables):
  - `VITE_SUPABASE_URL` (public)
  - `VITE_SUPABASE_ANON_KEY` (public)
  - `RESEND_API_KEY`
  - `EMAIL_FROM` (temporary: `onboarding@resend.dev`; final: `FaithTalk AI Support <support@faithtalkai.com>` after domain verification)
  - `EMAIL_REPLY_TO` (e.g., `support@faithtalkai.com`)
  - `EMAIL_TO_SUPPORT` (e.g., `support@faithtalkai.com`)
  - Optionally: `VITE_STRIPE_PUBLIC_KEY`, `VITE_STRIPE_PRICE_MONTHLY`, `VITE_STRIPE_PRICE_YEARLY`

- Supabase (Project Settings → Configuration → Secrets):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PORTAL_CONFIGURATION_ID` (optional, to pin Customer Portal config)

- Stripe Dashboard: API keys, Customer Portal configuration, webhook destination and secret.
- Resend Dashboard: API key and `faithtalkai.com` domain verification (DKIM). Use `onboarding@resend.dev` until verified.

Local development env file (example): create `.env.local` in repo root for Vite with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 4) Implemented Features

Billing/Stripe
- Supabase Edge Function `create-billing-portal-session` with:
  - Safer customer mapping: search Stripe by email before creating
  - Never overwrite non-null `profiles.stripe_customer_id`
  - Optional pin to a specific Portal configuration via `STRIPE_PORTAL_CONFIGURATION_ID`
- Vercel API proxy `/api/create-billing-portal-session` with improved error bubbling and GET/POST support.

Webhooks
- `handle-stripe-webhook` with async signature verification (`constructEventAsync` + `createSubtleCryptoProvider`), handles:
  - `checkout.session.completed`: set `profiles.stripe_customer_id`, upsert subscription
  - `customer.subscription.*`: upsert `subscriptions`
  - `invoice.*`: placeholders for future logic
- JWT disabled for webhook (`verify_jwt=false`).

Email/Resend
- `api/_utils/email.mjs` provides `sendEmail` and `sendSupportLeadNotification`.
- `api/leads.mjs` inserts `leads` row and triggers support email.
- `api/email-test.mjs` supports `?debug=1` to expose `{ ok, id, error, code }` and env visibility for troubleshooting.

Admin/User UI (code present)
- Admin-related components exist under `src/components/admin/**`; full wiring to backend needs review.
- Core chat UI and selection features are present per README; Vite build succeeds.

---

## 5) Current Issues / Work in Progress

- Transactional emails not arriving in production:
  - Likely From/domain verification issue. Use `EMAIL_FROM=onboarding@resend.dev` until `faithtalkai.com` is verified in Resend.
  - Ensure latest `/api/email-test` with `?debug=1` is deployed (branch merge required).
- Stripe Customer Portal needs configuration polish (pause, invoice history, return text).

---

## 6) Validation Runbook

1) Build locally
```
npm ci
npm run build
```

2) Merge and deploy the email diagnostics (branch: `feat/email-resend-transactional`)
- Open PR → merge → Vercel redeploy Production.

3) Email test (Production)
```
curl -sS 'https://<your-domain>/api/email-test?debug=1'
curl -sS -X POST 'https://<your-domain>/api/email-test?debug=1' \
  -H 'Content-Type: application/json' \
  --data '{"to":"support@faithtalkai.com","subject":"Resend wired","html":"<p>It works.</p>"}'
```
Check Resend → Emails for status.

4) Lead notification
```
curl -sS -X POST https://<your-domain>/api/leads \
  -H 'Content-Type: application/json' \
  --data '{"email":"you+leadtest@faithtalkai.com","name":"Resend Test","source_path":"/test","consent_email":true}'
```

5) Billing portal
```
curl -sS -X POST https://<your-domain>/api/create-billing-portal-session \
  -H 'Content-Type: application/json' \
  --data '{"userId":"<uuid>","returnUrl":"https://<your-domain>/account"}'
```

6) Webhook
- Stripe Dashboard → replay events to: `https://<SUPABASE_PROJECT_REF>.functions.supabase.co/handle-stripe-webhook`
- Expect `{"received": true}` and DB updates in `profiles` / `subscriptions`.

---

## 7) Future Enhancements

- Video/audio “Zoom-like” character discussions (evaluate WebRTC/SDKs, auth, moderation).
- Deep research tools: scripture provenance, commentaries, semantic search over curated corpora.
- Multilingual expansion (start with Spanish/Portuguese; i18n routing and content).
- Pastor/Admin payment flows: tiered plans, teams/seats, consolidated billing, admin dashboards.

---

## 8) Contact and Operational Notes

- Human support mailbox: `support@faithtalkai.com` (Google Workspace).
- Keep secrets in platform stores (Vercel/Supabase/Stripe/Resend). Never commit secrets.
- Treat this document as living; update after each change to billing, email, or infrastructure.
