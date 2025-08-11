# FaithTalkAI — Comprehensive Project Hand-off

This document gives a full, end-to-end overview of the FaithTalkAI project so the next engineer can ramp up immediately and continue shipping with confidence.

---

## Quick Links
- Production: https://faithtalkai.com  
- GitHub: https://github.com/stroka22/bible-character-chat  
- Local repo (Brian): `/Users/brian/bible-character-chat`

---

## Vision & Product Summary
FaithTalkAI is a multi-tenant Bible-character chat platform. Users converse with historically and theologically grounded personas. The product supports free / premium tiers, rich admin tooling for content management, and superadmin tooling for organization-level oversight.

Roadmap ideas:
• Round-table group chats (multiple characters + user)  
• Audio / video (Zoom-like) sessions with characters  
• Character-led Bible-study flows  
• Deep research tools on biblical texts & history  
• Multi-language model & UI support  
• Sermon-series generator for pastors  
• Ongoing UI/UX polish

---

## Architecture Overview
Frontend: React (Vite) + Tailwind utility classes  
State:  
  • AuthContext — auth, profile, role helpers  
  • ConversationContext — persistence layer  
  • ChatContext — chat orchestration  
Backend: Supabase (Auth, PostgREST, RLS, SQL functions)  
Payments: Stripe (via stripe-safe service; UI block removed)  
Multi-tenancy: `owners` table scoped by `owner_slug`

---

## Key Folders & Files
- `src/App.js` — router & guards  
- `src/contexts/*` — Auth, Conversation, Chat providers  
- `src/pages/`  
  • `AdminPage.js` — main admin tabs  
  • `admin/AdminInvitesPage.jsx`  
  • `admin/SuperadminUsersPage.jsx`  
- `src/components/admin/`  
  • AccountTierManagement.jsx  
  • AdminFAQEditor.jsx, AdminFavorites.jsx, AdminFeaturedCharacter.jsx  
  • GroupManagement.js/.tsx  
- `src/repositories/characterRepository.js`  
- `src/services/` — supabase, stripe-safe, tierSettingsService, invitesService  
- `scripts/`  
  • `min_owners.sql`, `owners_policies_superadmin.sql`, `run_sql.cjs`  
- `docs/HANDOFF.md` — this document

---

## Routing & Access Control
ProtectedRoute → requires auth  
AdminRoute → requires `isAdmin()` (admin|superadmin)  

Key routes (see `src/App.js`):  
`/` Home • `/login` • `/signup` • `/pricing` • `/faq`  
`/chat` (+ `:conversationId`, `/shared/:shareCode`)  
`/admin` (main tabs) • `/admin/invites` • `/admin/users` (superadmin)  
`/profile` • `/settings` • `/conversations` • `/favorites`

---

## Roles
`user` | `pastor` | `admin` | `superadmin` (stored in `profiles.role`)  
Helpers (`AuthContext`): `isSuperadmin`, `isAdmin` (admin or superadmin), `isPastor`

---

## Multi-tenancy Model
`owners` table → `owner_slug`, `display_name`  
Profiles carry `owner_slug`; superadmins can create orgs & move users.  
Tier settings persisted per `owner_slug` via `tierSettingsService`.

---

## Database & RLS Highlights
Tables: `profiles`, `owners` (+ characters, etc.)  
Function: `public.current_user_role()` SECURITY DEFINER  
Policies:  
  • `owners` select → authenticated  
  • `owners` insert/update → `current_user_role() = 'superadmin'`

Scripts: `scripts/min_owners.sql`, `scripts/owners_policies_superadmin.sql`  
Execute via `node scripts/run_sql.cjs …`

---

## Payments
Stripe-safe service stores `stripe_customer_id` on `profiles`.  
Stripe config block removed from Account Tier admin UI (cleaned).

---

## Admin Features (`AdminPage.js`)
1. **Characters** — CSV bulk upload, create/edit/delete, visibility toggle, search, export, bulk delete.  
2. **Groups** — character groupings.  
3. **Featured Character** — site-wide highlight.  
4. **User Favorites** — view curated favorites.  
5. **FAQ Editor** — manage FAQ.  
6. **Account Tiers** — set free message limit, free character count, pick free characters; saves to Supabase + localStorage; cross-tab sync.

Superadmin shortcut button at top links to `/admin/users`.

---

## Superadmin Features (`SuperadminUsersPage.jsx`)
- Filterable users table (search, role, org).  
- Change user roles (cannot demote superadmin).  
- Move users between orgs.  
- Create organization modal (slugify, RLS-protected).  

---

## Invite System
Admin-generated invite codes to elevate roles, scoped to `owner_slug`.

---

## Tier Enforcement
Free vs premium character list + free message limits enforced globally,
using both character IDs and fallback names to avoid ID-type mismatch.

---

## Chat & Conversation
ChatContext → message flow; ConversationContext → storage & share links; SimpleChatWithHistory used for all chat routes.

---

## Fixes Already Landed
- PostgREST bad column refs removed.  
- `owners` table + RLS created; helper function avoids recursion.  
- Stripe switched to `profiles` table.  
- Premium gating ID vs string mismatch fixed.  
- Cross-tab/localStorage event sync; bypass-mode conversation saving stabilized.

---

## Current Status
✅ Admin & Superadmin UIs live in production  
✅ Organization creation + RLS verified  
✅ Stripe block removed  
Next: QA multi-tenant tier enforcement, polish UI, implement roadmap features.

---

## Local Development
```
npm install
npm run dev
cp .env.example .env   # add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.
```
SQL scripts:
```
export SUPABASE_PROJECT_REF=...
export SUPABASE_ACCESS_TOKEN=...
node scripts/run_sql.cjs scripts/min_owners.sql
node scripts/run_sql.cjs scripts/owners_policies_superadmin.sql
```
Push to `main` deploys (check repo’s deployment target).

---

## Code-Review Checklist
- AuthContext role logic & profile creation  
- SuperadminUsersPage → RLS alignment  
- AccountTierManagement → Supabase & localStorage paths  
- characterRepository CSV validations  
- owners SQL scripts idempotent  
- App.js guards for `/admin/users`  
- Service layers error handling

---

## Data Model Notes
Characters include rich metadata (timeline, context, study questions).  
`relationships` column is JSON for graph-like links.  
Featured character stored via admin UI.

---

## Observability
ErrorBoundary shows detailed info in dev; admin components log to console.

---

## Security
RLS hardened; role elevation via invites.  
`current_user_role()` used in policies.  
Keep queries tight—select only needed columns.

---

## Suggested Milestones
1. Round-table multi-character chats  
2. Audio/video via WebRTC (LiveKit / Daily)  
3. Character-led Bible studies with citations  
4. Deep research module (timeline, maps, textual criticism)  
5. Internationalization (i18n + multilingual models)  
6. Pastor sermon-series generator  
7. UI/UX refinement

---

**End of Hand-off** — Welcome aboard and happy building!
