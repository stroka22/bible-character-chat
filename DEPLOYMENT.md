# 🚀 Deployment Guide – Bible Character Chat

This guide walks you through taking the project **from GitHub → live production** with working Stripe payments and Supabase back-end.

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node | 18 + | Front-end / CLI scripts |
| npm / pnpm | latest | dependency management |
| Supabase CLI | ≥ 1.134 | push SQL & deploy Edge Functions |
| Vercel CLI | latest | optional zero-config frontend hosting |
| Stripe account | Test & Live keys | subscriptions |
| GitHub | repo hosting | CI / branch rulesets |

---

## 2. Clone & Install

```bash
git clone https://github.com/your-org/bible-character-chat.git
cd bible-character-chat
npm install          # or pnpm install
```

---

## 3. Environment Variables

Create a local file called `.env.local` (NOT committed):

```
# Public (sent to browser via Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx              # or pk_live_xxx
VITE_STRIPE_PRICE_MONTHLY=price_xxx
VITE_STRIPE_PRICE_YEARLY=price_xxx

# Server-only (Supabase Edge / Vercel)
STRIPE_SECRET_KEY=sk_test_xxx                  # never exposed client-side
```

Add `STRIPE_SECRET_KEY` inside:

1. **Supabase Dashboard → Project Settings → Environment Variables → Add variable**  
2. **Vercel Dashboard → Project → Settings → Environment Variables**

---

## 4. Database & Auth

### 4.1 Spin up Supabase locally (optional)

```bash
supabase start
```

### 4.2 Apply SQL schema

```bash
supabase db reset        # wipes local db
supabase db push         # applies /supabase/migrations/*.sql
```

### 4.3 Enable Email Auth  
Supabase Dashboard → Authentication → Providers → Email → **ON**

---

## 5. Stripe Setup

1. Dashboard → **Products → Prices**  
   Create two recurring prices that match `VITE_STRIPE_PRICE_*`.
2. Developers → Webhooks → **Add endpoint**  
   URL: `https://<your-vercel-app>/api/stripe-webhook`  
   Events:  
   `checkout.session.completed`, `invoice.payment_succeeded`,  
   `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy the webhook secret → `STRIPE_WEBHOOK_SECRET` env var *(if you validate signatures)*.

---

## 6. Supabase Edge Function – `create-checkout-session`

### 6.1 File layout

```
supabase/
└─ functions/
   └─ create-checkout-session/
      └─ index.ts
```

Code already included in repo (imports Stripe, uses `STRIPE_SECRET_KEY`).

### 6.2 Deploy

```bash
supabase functions deploy create-checkout-session
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
```

Supabase prints the **invoke URL** (e.g.  
`https://<project>.functions.supabase.co/create-checkout-session`).

---

## 7. Front-end Wiring

`src/services/stripeClient.ts` calls the Edge Function:

```ts
const resp = await fetch('/api/create-checkout', { ... });
const { url } = await resp.json();
window.location.href = url;          // redirect to Stripe
```

Vite proxy (vite.config.ts) can forward `/api/*` locally.

---

## 8. Local Development

```bash
# one tab: Supabase & Edge Functions
supabase start
supabase dev         # hot-reload functions

# second tab: Vite React
npm run dev
```

App loads at `http://localhost:5173`.

---

## 9. Production Deploy (Vercel)

```bash
# first time only
vercel link          # select existing project
vercel env add       # add all env vars incl. STRIPE_SECRET_KEY
vercel --prod        # build & deploy
```

The Vercel build uses `vite build` → `dist/` → served as static front-end.

---

## 10. Secure Keys Checklist

- **Never** expose `STRIPE_SECRET_KEY` or Supabase service role key to the browser.
- Only `VITE_*` vars are exposed client-side.
- Rotate keys immediately if committed accidentally (GitHub history).

---

## 11. Common Errors & Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Checkout returns to home instantly | Client couldn’t fetch Edge Function | Check function URL / CORS |
| Stripe “No such price” | Wrong `VITE_STRIPE_PRICE_*` | Copy live/test price IDs |
| Webhooks fail (400) | Missing secret validation or wrong URL | Re-set endpoint & secret |
| Supabase RLS blocking inserts | Auth user missing | Ensure `auth.uid()` matches row policy |

---

## 12. Production Hardening

- Enable **Row Level Security** (already in migrations).
- Enforce HTTPS only cookies in Supabase auth.
- Add CI status checks (GitHub Actions) then re-enable branch protection rules.

---

**You’re ready to launch!**  
May your chats be blessed and your deployments smooth. ✨
