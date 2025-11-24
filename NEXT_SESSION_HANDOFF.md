# Kickoff Message for Next Session

Welcome! This handoff summarizes the FaithTalkAI “Bible Character Chat” project to date, including architecture, features, database schema, deployment, and active work. Start by reviewing the Handoff Document below. Then:

- Pull the repo and run locally with the provided .env.
- Verify production deployment (Vercel) is showing the latest improvements:
  - Roundtable sticky header, auto-start toggle.
  - Admin Studies fields: Subject and Character Instructions.
  - Header dropdown is clickable; Sign Out works on Mac.
- Review open UX issues (Windows white-on-white, footer subscribe on mobile) and current priorities.
- See Roadmap for upcoming features: video/audio roundtables, deep Bible research tools, multi-language support, sermon series builder.

When ready, continue implementation with the Immediate Next Steps at the bottom.

—End of kickoff—


# Comprehensive Handoff Document

## 1) Executive Summary

FaithTalkAI is a multi-tenant, tiered web application that lets users chat with Bible characters, participate in multi-character “Roundtable” discussions, and learn through curated Bible Studies. It uses Supabase for auth/data, Stripe for premium detection, Vercel for hosting, and OpenAI for responses.

This document gives you:
- Full tech stack and architecture.
- How to set up locally and deploy.
- Database schema and RLS policies.
- All implemented features (superadmin, admin, user).
- Current issues, ongoing work, and a future roadmap.

Goal: Seamless continuation of high-quality, fast progress.


## 2) Tech Stack

- Frontend  
  - React + Vite  
  - Tailwind CSS  
  - React Router  
- Backend/Platform  
  - Supabase (Auth, Postgres, RLS, optional Edge Functions)  
  - Stripe (subscription/premium detection)  
  - OpenAI API (character responses)  
- Hosting/CI  
  - Vercel (GitHub integration, production + preview)  
- State and Contexts  
  - AuthContext: session, role, premium status  
  - ConversationContext: conversation persistence  
  - RoundtableContext: multi-character orchestration  
  - ChatContext: lesson context injection  
- Repositories  
  - characterRepository, conversationRepository, roundtableSettingsRepository, bibleStudiesRepository, etc.


## 3) Repos, Code, and Important Paths

- Repo: GitHub (linked in Vercel project “bible-character-chat”)  
- Local root: /Users/brian/bible-character-chat  

Key directories/files:
- src/
  - components/ (Header.jsx, FABCluster.jsx, ScalableCharacterSelection.jsx, UpgradeModal.jsx)
  - components/chat/ (SimpleChatWithHistory.js)
  - contexts/ (AuthContext.js, ConversationContext.jsx, RoundtableContext.jsx, ChatContext.jsx)
  - pages/ (RoundtableSetup.jsx, RoundtableChat.jsx, StudiesPage.jsx, StudyDetails.jsx, StudyLesson.jsx, admin/AdminStudiesPage.jsx, HomePage.js)
  - repositories/ (bibleStudiesRepository.js, roundtableSettingsRepository.js, characterRepository.js)
  - services/ (supabase.js, stripe.js, openai.js)
  - App.js (routing)
- scripts/ (bible_studies_schema.sql, bible_studies_policies_admin_superadmin.sql, bible_studies_seed_sotm.sql, roundtable_settings_table.sql, run_sql.cjs)
- supabase/ (migrations/)
- .env (local dev config)
- vercel.json, tailwind.config.js


## 4) Environment and Configuration

- .env keys:  
  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_OPENAI_API_KEY,  
  VITE_STRIPE_PUBLIC_KEY, VITE_STRIPE_PRICE_MONTHLY, VITE_STRIPE_PRICE_YEARLY,  
  optional VITE_SUPABASE_PROJECT_REF, VITE_SUPABASE_EDGE_FUNCTION_URL, feature toggles.

- Supabase CLI/API: set SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN, then `node scripts/run_sql.cjs <sql-file>`.

- Vercel: project id `prj_PSuP6…`, auto-deploy on push to main.


## 5) Setup and Local Development

1. `npm install`  
2. `npm run dev` (local)  
3. `npm run build` / `npm run preview`  
4. Apply schema via SQL Editor or `run_sql.cjs`.  
   Scripts are idempotent.


## 6) Database Schema (Core Tables + RLS Overview)

- characters, tier_settings, roundtable_settings, conversations/messages  
- bible_studies (new columns: subject, character_instructions)  
- bible_study_lessons, user_study_progress  
All protected with RLS; admins/superadmins bypass where needed.


## 7) Authentication, Roles, and Premium Detection

AuthContext handles Supabase session, role (superadmin, admin, pastor, user) and Stripe subscription check (`isPremium`). UI gates Admin pages and premium features accordingly.


## 8) Stripe Integration

stripe.js lazy-loads Stripe, UpgradeModal drives checkout. PricingPage lists plans.


## 9) OpenAI Integration

openai.js handles streaming responses. RoundtableContext generates multi-character replies.


## 10) Roundtable Feature (Implemented)

Setup page lets user pick characters, topic, repliesPerRound, auto-start toggle.  
RoundtableContext manages rotation, follow-ups, limits, and auto-start.  
RoundtableChat has sticky header and Advance Round button.


## 11) Bible Studies Feature (Implemented)

AdminStudiesPage CRUD for studies/lessons (new Subject & Character Instructions fields).  
StudiesPage → StudyDetails → StudyLesson injects lesson context into chat.  
Schema + seed script provided.


## 12) Core Chat and Upgrade UX

SimpleChatWithHistory gates non-premium users, injects lesson context, persists conversation. FABCluster shows Start Roundtable & Upgrade buttons.


## 13) Superadmin / Admin Features

Org-scoped tier settings, roundtable defaults, Bible Studies admin, characters management, RLS policies.


## 14) Deployment

Vercel auto-deploy on push. Manual trigger:  
`POST /v13/deployments` with payload `{ name, project, gitSource }`.  
Build command: `vite build`, output `dist`.


## 15) Current Issues and Ongoing Work

- Roundtable header clipping on some devices.  
- Windows white-on-white dropdown contrast.  
- Footer Subscribe button overflow on small mobile.  
- Admin Panel link requires refresh after login.  
- Hero CTAs occasionally missing.  
- Ensure new study fields persist end-to-end.  
- Validate Sign Out across devices.  
- Tier limits QA.


## 16) Roadmap / Future Improvements

- Video/audio roundtables (WebRTC or third-party).  
- Deep Bible research tools with citations.  
- Multi-language UI and chat.  
- Pastor sermon series builder.  
- Bundle splitting & performance.  
- Accessibility (WCAG) and theming.


## 17) Interaction Flow (High Level)

Auth → Repos (Supabase) → Chat/OpenAI → UI components.  
RoundtableContext orchestrates multi-character flow.  
Bible Studies inject context into chats.  
Stripe determines premium gating.


## 18) Security

RLS on sensitive tables, HTTPS avatar URL enforcement, secret keys in server env only.


## 19) Post-Deploy QA Checklist

- Auth sign-in/out, dropdown click (Mac).  
- Roundtable auto-start & header.  
- Admin Studies new fields create/edit.  
- Lesson chat start.  
- Hero CTAs present, footer responsive, Windows contrast OK.


## 20) Immediate Next Steps

1. QA production for recent fixes.  
2. Fix Windows contrast & footer layout.  
3. Ensure Admin Panel link renders post-login.  
4. Review tier limits logic.  
5. Draft video/audio roundtable prototype plan.  
6. Outline deep research and i18n scopes.

# End of Handoff Document

If you need more info (e.g., UX walkthrough or code deep-dive), ask and we’ll append.  


---

## Admin Organization Subscription – Production Readiness

Priority: Make Admin Org subscription purchasable at `/admin/upgrade` (login + admin). Pricing: $97/mo, $970/yr.

What changed this session:
- Confirmed build OK; payments use client-side Stripe Checkout via `@stripe/stripe-js`.
- `src/pages/AdminUpgrade.jsx`: added a small env/debug panel (toggle with `?debug=1`) to display Stripe mode (live/test), detected publishable key prefix, and the price IDs in use. Supports URL overrides.

Production envs to set in Vercel (same Stripe account and same mode):
- `VITE_STRIPE_PUBLIC_KEY` = `pk_live_...`
- `STRIPE_SECRET_KEY` = `sk_live_...`
- `VITE_STRIPE_PRICE_ADMIN_ORG_MONTHLY` = `price_...`
- `VITE_STRIPE_PRICE_ADMIN_ORG_YEARLY` = `price_...`

Testing without envs (or to sanity-check):
- Visit `/admin/upgrade?debug=1&price_monthly=price_XXX&price_yearly=price_YYY`
  - Panel should show Stripe mode and override prices.
  - Click Upgrade → redirects to Stripe Checkout.

Post-purchase:
- Success redirects to `/admin?upgraded=1`.
- Billing portal endpoint exists: `/api/create-billing-portal-session`.

Sanity checklist:
1) Keys and price IDs all from the SAME Stripe account.
2) Live keys with live prices in production. No `_test_` prices with `pk_live_`.
3) If needed, ping Brian to share masked `pk_/sk_/price_` for alignment check.
