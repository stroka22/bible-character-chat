# FaithTalkAI / Bible Character Chat  
Comprehensive Project Handoff  
_Last updated: July 2025_

---

## 1. Project Overview
FaithTalkAI (a.k.a. Bible-Character-Chat) is a web application that lets users conduct conversational Q&A with AI-powered biblical characters.  
Key goals:

* Provide spiritually-oriented chat with > 50 OT/NT characters
* Freemium business model – limited free tier, unlimited premium
* Modern, mobile-friendly UI with React + Tailwind
* Managed back-end services only (Supabase, Stripe, Vercel)

Main user-facing features  
1. Character gallery with search, filters, favourites, featured banner  
2. Real-time chat interface with message streaming  
3. Conversation history & favourites pages  
4. Stripe-powered subscription (“Premium”) unlocking all characters + unlimited messages  
5. Admin console (feature toggles, FAQ editor, tier management)

---

## 2. Architecture Overview
| Layer | Technology | Notes |
|---|---|---|
| Front-end | React 18 + Vite, TailwindCSS, Framer-Motion | All UI & client logic lives in `src/` |
| API / DB | Supabase 1.0 (PostgreSQL + Edge Functions) | Auth, storage, row-level security, Stripe hooks |
| Payments | Stripe Checkout (client-only) **plus** fallback Edge Function | Keys injected via Vercel env |
| Hosting | Vercel (static + serverless) | Automatic CI from GitHub `main` |

Important NPM libs  
* `@supabase/supabase-js` – DB & auth  
* `@stripe/stripe-js` – Checkout redirect  
* `react-router-dom v6` – routing  
* `react-virtuoso` – virtualized grid  
* `framer-motion` – card animations

---

## 3. Repository Structure (top-level)
```
/
├─ public/                # Static assets & fallback html pages
│   └─ pricing.html       # Marketing pricing page (static)
├─ src/
│   ├─ components/        # Re-usable UI components
│   │   ├─ chat/          # Chat UI pieces
│   │   ├─ modals/        # UpgradeModal.jsx etc.
│   │   ├─ admin/         # Admin dashboards
│   │   └─ design-guidelines/
│   ├─ contexts/          # React context providers
│   ├─ pages/             # Route-level pages (HomePage.js, PricingPage.js …)
│   ├─ services/          # API helpers (stripe.js, supabase.js)
│   └─ main.js            # App bootstrap for Vite
├─ supabase/
│   └─ functions/         # Edge Functions (create-checkout-session, get-subscription …)
├─ vercel.json            # Rewrite rules & build config
└─ PROJECT_HANDOFF.md     # ← this document
```

---

## 4. Database Setup (Supabase)
Project ref example: `abcd1234xyz`

### Tables
| Table | Columns | Notes |
|---|---|---|
| `users` | `id uuid PK`, `email`, `stripe_customer_id text`, `is_admin bool` | Row created automatically by Supabase Auth trigger |
| `characters` | `id int PK`, `name`, `avatar_url`, `description`, `bible_book`, `is_free bool` | Seeded via CSV in `/public/sample-characters.csv` |
| `conversations` | `id uuid PK`, `user_id FK`, `title`, `created_at` | One row per chat |
| `messages` | `id uuid PK`, `conversation_id FK`, `role`, `content`, `created_at` | GPT messages |
| `favorites` | `user_id`, `character_id`, composite PK | Stored also in localStorage for speed |

### Edge Functions
* `create-checkout-session` – server fallback when client-only Checkout fails  
* `get-subscription` – returns active Stripe sub for a customer  
* `create-customer` – lazily creates Stripe customer and stores id

All functions live in `supabase/functions/*`, TypeScript build via Supabase CLI.

---

## 5. Authentication
* Supabase Auth (email + password, social providers optional)  
* `AuthProvider` in `src/contexts/AuthContext.jsx` wraps entire app  
* `ProtectedRoute` component guards `/admin`, `/conversations`, `/favorites`  
* During dev you can bypass auth by setting `localStorage.setItem('bypass_auth','true')`.

---

## 6. Key Features & Implementation

### Character Selection
File: `src/components/ScalableCharacterSelection.js`  
* Virtualised grid/list (react-virtuoso)  
* Filters: search, OT/NT, book, group, first letter, favourites  
* “Unlock all characters” CTA → `https://faithtalkai.com/pricing`  
* Feature flags for free vs premium read from `localStorage.accountTierSettings`

### Chat Interface
* Streaming chat bubbles (`src/components/chat/ChatBubble.js`)  
* Conversation persisted in Supabase table then cached locally  
* `MessageLimitHandler` prompts upgrade after 5 messages (free tier)

### Favourites
* Heart icon on `CharacterCard.jsx`; ids stored in localStorage + `favorites` table  
* Dedicated `/favorites` page (`src/pages/FavoritesPage.jsx`)

### Featured Character
* Admin can set default; stored in `localStorage.featuredCharacter` or `?featured=` URL

### Admin Console
Located at `/admin` – tabs:
1. Featured Character
2. FAQ Editor
3. Account Tier Management
4. User Favourites dashboard

---

## 7. Deployment

### Build & Hosting
* Vercel project connected to GitHub repository `stroka22/bible-character-chat`
* `vercel.json`
  ```json
  {
    "buildCommand": "vite build",
    "outputDirectory": "dist",
    "rewrites": [
      { "source": "/((?!.*\\.html$).*)", "destination": "/index.html" }
    ]
  }
  ```
* Automatic deployment on push to `main`.

### Environment Variables (set in Vercel + .env.local)
```
VITE_SUPABASE_URL=https://abcd1234xyz.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_PROJECT_REF=abcd1234xyz
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_STRIPE_PRICE_MONTHLY=price_123
VITE_STRIPE_PRICE_YEARLY=price_456
STRIPE_SECRET_KEY=sk_test_...
```

---

## 8. Payment Integration (Stripe)

### Flow
1. User clicks upgrade
2. `services/stripe.js`:
   * Tries direct client-side `redirectToCheckout`
   * Falls back to `/api/create-checkout-session` or Supabase Edge Function
3. Success → Stripe redirects back to `/conversations?checkout=success`

### Code samples
```js
import { createCheckoutSession } from '../services/stripe';

await createCheckoutSession({
  priceId: SUBSCRIPTION_PRICES.MONTHLY,
  successUrl: `${window.location.origin}/conversations?checkout=success`,
  cancelUrl: `${window.location.origin}/pricing?checkout=canceled`,
  customerEmail: user.email,
  metadata: { userId: user.id }
});
```

### Webhooks
Production webhooks point to Supabase Edge Function `handle-webhook` (not yet implemented); currently subscription status checked via Stripe API when user logs in.

---

## 9. Custom Domain Configuration
Domain: `faithtalkai.com` (GoDaddy)

1. In Vercel dashboard: add `faithtalkai.com` + `www.faithtalkai.com`
2. Update GoDaddy DNS:  
   * Nameservers → Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) **OR**  
   * Remove parked A-records (`3.33.130.190`, `15.197.148.33`) and add A/CNAME per Vercel instructions
3. Add domain to Stripe Checkout allowed live domains.

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Button still yellow / code not updating | Rewrite rule caching or failed deployment | Check latest deployment commit hash in Vercel, purge cache or redeploy |
| 500 on Stripe Checkout | Client-only integration not enabled | Stripe Dashboard → Settings → Checkout → enable client-only |
| `Invalid stripe.redirectToCheckout parameter: allowPromotionCodes` | Old param included | Already removed in `services/stripe.js` |
| `useAuth` error | Header rendered outside `AuthProvider` | Ensure Header imported inside `App.js` not `main.js` |
| DNS conflicts in Vercel | Old parked A records | Remove in GoDaddy or switch to Vercel nameservers |
| Large bundle warning > 500 KB | Vite chunk size | Optional: add manualChunks or dynamic import |

---

## 11. Future Development Ideas
* Implement true server-side streaming via Supabase Edge Functions
* Webhook processing to auto-update `users.is_premium`
* Role-based access for admin with Supabase RLS
* Migrate static pricing page into React route for unified look
* i18n support (multiple languages)
* Add unit/integration tests (Vitest + React Testing Library)
* Lighthouse performance optimisation (code-split Stripe JS)
* Server-side rendering with Next.js for SEO

---

## Appendix – Key File Paths

| Feature | File |
|---|---|
| Home page & upgrade button | `src/pages/HomePage.js` |
| Character selection grid | `src/components/ScalableCharacterSelection.js` |
| Character card | `src/components/CharacterCard.jsx` |
| Stripe helper | `src/services/stripe.js` |
| Auth context | `src/contexts/AuthContext.jsx` |
| Main router | `src/App.js` |
| Vercel config | `vercel.json` |
| Static pricing page | `public/pricing.html` |

---

_End of handoff document_
