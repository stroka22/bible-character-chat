# FaithTalkAI – Bible Character Chat

Comprehensive engineering hand-off for the next Droid. Covers architecture, environments, features, current status, known issues, and next steps. **Read thoroughly before making changes.**

---

## 1) Project Overview
- **Name:** FaithTalkAI – “Bible Character Chat”
- **Purpose:** Let users converse with Bible characters, learn biblical context, and equip pastors/leaders with tools (studies, outreach, lead capture, sales materials).
- **Stack**
  - Front-end: React (Vite), TypeScript + some JSX, Tailwind CSS
  - Back-end/Infra: Vercel serverless functions
  - Data & Auth: Supabase (Postgres + Auth + RLS)
  - AI: OpenAI via serverless proxy
  - Payments: Stripe code present (not in active scope)

---

## 2) Repositories, Code Locations & Key Files
| Area | Path |
| ---- | ---- |
| GitHub | https://github.com/stroka22/bible-character-chat |
| Local dir | `/Users/brian/bible-character-chat` |
| Entry | `src/main.tsx`, `src/App.tsx` |
| Contexts | `src/contexts/*` |
| Supabase client | `src/services/supabase.ts` (hardened env) |
| Leads service | `src/services/leads.ts` (posts to `/api/leads`) |
| FAQs service | `src/services/faqs.ts` |
| OpenAI proxy | `api/openai/chat.mjs` |
| Leads API   | `api/leads.mjs` (service-role insert) |
| Lead UI – banner | `src/components/LeadCaptureBanner.jsx` |
| Lead UI – modal | `src/components/LeadCaptureModal.jsx` |
| FAQ page | `src/pages/FAQPage.jsx` |
| Admin FAQ editor | `src/components/admin/AdminFAQEditor.jsx` |
| Admin extras | `src/components/admin/AdminFavorites.jsx`, `src/pages/admin/*` |
| Sales page & downloads | `src/pages/SalesPage.jsx`, `public/downloads/` |
| Chat | `src/components/chat/SimpleChatWithHistory`, Roundtable pages |

> ⚠️  Do a full repo scan & route walk-through first. Some `.jsx` lives in the TS project—Vite handles it.

---

## 3) Environments & Configuration
Create `.env.local` for dev, set **Production** vars in Vercel.

### Browser (Vite)
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

### Serverless (Functions)
```
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
VITE_SUPABASE_URL=https://<project>.supabase.co   # or SUPABASE_URL
OPENAI_API_KEY=<openai key>
```

- `src/services/supabase.ts` only uses envs if **both** are present; otherwise warns or falls back to dev credentials.
- After env changes, **redeploy**.
- Check `/api/leads` GET ⇒ `{ ok: true }`.

---

## 4) Data Model & Supabase
| Table | Purpose |
| ----- | ------- |
| `public.faqs`  | FAQs (category, question, answer, published, ordering) |
| `public.leads` | Lead capture submissions |

### Triggers
- `moddatetime` (no-arg) updates `updated_at`.

### RLS Policies (desired)
| Table | Policy | Role | Cmd |
|-------|--------|------|-----|
| leads | `leads_insert_anon` | anon | INSERT |
|       | `leads_insert_auth` | authenticated | INSERT |
|       | `leads_select_admins` | authenticated (admin/superadmin) | SELECT |
| faqs  | public read published | public | SELECT |
|       | admin CRUD | authenticated admin | INS/UPD/DEL |

---

## 5) Features by Role
### Public
- Marketing pages (Home, About, Contact, How It Works, Pricing, Careers, Press Kit)
- Sales page with download links (currently placeholders)
- Chat (`SimpleChatWithHistory`) and shareable routes
- Roundtable setup & chat
- FAQ from Supabase
- Lead capture UX  
  - Banner (mobile) + Modal (desktop)  
  - Exit-intent + 10 s fallback, 30-day dismissal memory  
  - `?lead_test=1` override

### Authenticated User
- Auth flows (Login/Signup/Reset)
- Conversations, Favorites, My Walk, Profile, Settings

### Admin
- `/admin` dashboard
- FAQ CRUD (`AdminFAQEditor`)
- Favorites fix, Studies & Invites pages

### Superadmin
- User management (`/admin/users`) with quick nav

---

## 6) Lead Capture Flow
1. **UI** shows banner / modal per device & triggers.  
2. `createLead()` → POST `/api/leads` (service role) → Supabase insert ➜ success.  
3. If API absent (local dev) → direct Supabase insert (needs RLS).  

Common errors  
- 401 = mismatched browser envs  
- 500 = missing `SUPABASE_SERVICE_ROLE_KEY` or server URL in function env

---

## 7) OpenAI Proxy
- Path: `/api/openai/chat.mjs`
- Expects `{ characterName, characterPersona, messages }`
- Uses `OPENAI_API_KEY`, returns `{ text }`

---

## 8) Downloads (Placeholders)
`public/downloads/`  
Replace with real PDFs/PPTX/ZIP.

---

## 9) Current Status & Known Issues
- Lead capture UI live; serverless `/api/leads` added.
- Env hardening in place.

**Blocking issue:** Production 500 on `/api/leads` = server envs not set.  
Fix = add `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, redeploy.

---

## 10) Testing Checklist
- No Supabase fallback warnings in console.
- `/api/leads` GET `{ ok:true }`; POST via curl succeeds.
- Desktop & mobile lead capture with `?lead_test=1`.
- FAQ public load & admin CRUD.
- Auth flows & admin routes.
- Chat + OpenAI proxy.
- Sales downloads render (will be placeholders until replaced).

---

## 11) Build & Run
```bash
npm install        # Node 18+
npm run dev        # local dev
npm run build      # production build
```
Deploy on Vercel → set envs → redeploy → verify `/api/leads`.

---

## 12) Admin Model
`public.profiles.role` must be `admin` or `superadmin` for admin UI & leads SELECT.

---

## 13) Supabase SQL Reference (Leads)
```sql
-- enable
alter table public.leads enable row level security;

-- insert policies
create policy leads_insert_anon
on public.leads for insert to anon with check (true);

create policy leads_insert_auth
on public.leads for insert to authenticated with check (true);

-- select for admins
create policy leads_select_admins
on public.leads for select to authenticated
using ( exists (
  select 1 from public.profiles p
  where p.id = auth.uid()
    and p.role in ('admin','superadmin')
));

-- grants
grant usage on schema public to anon, authenticated;
grant insert on public.leads to anon, authenticated;
```

---

## 14) Roadmap
Near-term  
- Finalize envs, verify lead pipeline, replace download assets, connect ESP/SMS, add lead reporting.  

Medium-term  
- Deep research tools, multi-language support, sermon series generator, video/audio roundtables.  

Long-term  
- Full pastor dashboard, mobile apps.

---

## 15) Handoff To Next Droid
1. Clone repo, run locally with proper `.env.local`.  
2. Check Production envs, redeploy; ensure `/api/leads` POST works.  
3. Test lead capture (`?lead_test=1`) desktop & mobile.  
4. Verify FAQ CRUD & public load.  
5. Audit RLS; keep serverless pattern for writes.  
6. Replace placeholder assets; plan ESP/SMS.  
7. Begin roadmap features.

**If unclear, search referenced files and read surrounding code.** This project mixes TS & JSX—Vite handles both. Keep momentum and ship!
