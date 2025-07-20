# Bible Character Chat – Handoff Document  
*Version: 2025-07-10*

---

## 1  Project Overview & Purpose  
Bible Character Chat is a React + Supabase web application that lets users converse with richly-modelled biblical characters.  
Roles:  
- **User** – browse characters, chat, manage own profile  
- **Admin** – everything User can do + manage users  
- **Pastor (super-admin)** – full CMS: create/edit characters, moderate conversations, manage schema  

> **IMPORTANT – On-boarding:**  
> Before doing any fixes, **read Section 11 (Key Files to Review First)** to understand critical code locations and what to watch for.

---

## 2  Current State & Issues  
| Area | Status | Blocking Issues |
|------|--------|-----------------|
| Authentication | Works. Session returns correct user. | None |
| Profiles table | Exists, but old RLS caused infinite recursion. | Fixed SQL below still needs to be run/verified |
| Characters table | Exists but uses `name`, `description`, `opening_line` instead of code-expected `character_name`, `short_biography`, `opening_sentence`. | Main app fails to load characters. |
| Main React app | Builds but renders blank screen. | JS errors due to column mismatch & profile fetch failing. |
| Emergency app v1 | Loads but errors (same reasons). | — |
| Emergency app v2 | **Works** with current schema and basic admin functions. | Not yet merged into repo |
| Admin recognition | DB shows `role=admin` but UI still “not admin” (before RLS fix). | Needs cache clear/session refresh after RLS fix. |

---

## 3  Database Structure (PostgreSQL / Supabase)

### profiles
| column | type | notes |
|--------|------|-------|
| id (PK, FK auth.users) | uuid | Supabase UID |
| email | text |
| display_name | text |
| avatar_url | text |
| role | text  (`user` \| `admin` \| `pastor`) |
| created_at | timestamptz |
| updated_at | timestamptz |

### characters
Current columns  
`id, name, description, persona_prompt, opening_line, avatar_url, created_at, is_visible, timeline_period, historical_context, geographic_location, key_scripture_references, theological_significance, relationships (jsonb), study_questions, testament, bible_book, "group", feature_image_url`

Expected by React code (missing): `character_name, short_biography, opening_sentence, updated_at, key_events (jsonb), character_traits (jsonb)`

### conversations / messages
Planned but not finalised (schema draft exists in code).

---

## 4  Application Architecture
```
React 18 (Vite) ➜ Supabase JS v2 client
│
├── pages/
│   ├── CharacterGrid
│   ├── ChatPage
│   ├── AdminDashboard (tabs: Users, Characters, DB)
│   └── Auth pages
├── public/
│   ├── emergency-app.html   (old)
│   ├── emergency-app-v2.html (schema-safe)
│   ├── session-debug.html
│   └── direct-test.html
└── supabase/
    ├── client.js
    └── auth helpers
```
Build command `npm run build`, dev `npm run dev`.

---

## 5  Files Created / Modified in Debug Phase
- `public/emergency-app-v2.html` – complete fallback UI (works with current schema)
- `public/session-debug.html` – deep session/RLS tester
- `public/direct-test.html` – minimal Supabase connectivity tester
- `public/database-setup.html` & `public/direct-fix.html` (older tools)
- README snippets & SQL scripts in chat (not yet committed)

---

## 6  Future Feature Plans
1. **AI Persona Enhancements**
   - Use OpenAI Functions to let characters access structured timeline/key events.
   - Emotion-aware responses.
2. **Conversation Persistence**
   - conversations/messages tables with per-user chat history.
3. **Pastor CMS Dashboard**
   - Rich form with markdown editor, image upload, preview.
4. **Public Sharing**
   - Shareable conversation links, privacy toggles.
5. **Gamification**
   - Badges for exploring OT/NT characters.
6. **Mobile PWA**
   - Offline reading of character bios, delayed chat sync.
7. **Audio Conversations**
   - Provide optional text-to-speech playback of character responses.
   - Allow users to choose different voice models (male/female, accent).
   - Leverage browser SpeechSynthesis or external TTS API for higher quality.
8. **Visual Avatars & Lip-Sync**
   - Display animated portraits or 3-D avatars for each character.
   - Real-time lip-sync tied to the generated TTS audio for immersive dialogs.
   - Future AR mode: place avatars in camera view for mixed-reality experience.

---

## 7  Immediate Next Steps
1. **Run RLS-fix SQL** (below) in Supabase SQL editor.
2. **Restart dev server** `npm run dev`, clear browser cache.
3. **Verify** admin status via `session-debug.html` (“Check Profile”).
4. **Merge** `emergency-app-v2.html` into git and set as /emergency route.
5. **Choose Schema Fix**  
   a) QUICK: create DB view/aliases for missing fields, OR  
   b) BETTER: refactor React code to use existing column names.
6. If main app still blank, open DevTools → Console for runtime errors.

---

## 8  Code Paths & Repository Info
- Local root: `/Users/brian/bible-character-chat`
- GitHub: `https://github.com/stroka22/bible-character-chat`
  - Active branch during fixes: `feat/secure-auth-system`
- Build output: `dist/`
- Public static files: `/public`
- Vite config: `vite.config.js`

---

## 9  Supabase Configuration
Project ID: `sihfbzltlhkerkxozadt`  
URL: `https://sihfbzltlhkerkxozadt.supabase.co`  
Anon key (public): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  
RLS: Enabled on `profiles`, `characters`  
Storage buckets: `avatars` (planned)  
Edge functions: none yet  
SQL functions created: none (exec_sql was attempted but dropped)

---

## 10  Complete Technical Details

### 10.1 SQL to Fix Profiles RLS
(Execute once)
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES 
  ('f70a4893-ee61-4079-a760-f1871e6ae590','stroka22@yahoo.com','admin',NOW(),NOW())
ON CONFLICT (id) DO UPDATE SET role='admin', updated_at=NOW();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename='profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY profiles_select  ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert  ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY profiles_update  ON public.profiles FOR UPDATE USING (true);
CREATE POLICY profiles_delete  ON public.profiles FOR DELETE USING (true);
```

### 10.2 Options to Solve Character Column Mismatch  
A. **Database View**
```sql
CREATE OR REPLACE VIEW public.characters_expected AS
SELECT id,
       name            AS character_name,
       description     AS short_biography,
       opening_line    AS opening_sentence,
       *               -- other cols unchanged
FROM public.characters;
```
Modify Supabase Row API path to `characters_expected`.

B. **React Refactor**
Search/replace all occurrences of `character_name`, `short_biography`, `opening_sentence` in `src/` to mapped fields.

### 10.3 Admin Detection Logic
```
isAdmin = profile.role === 'admin' || profile.role === 'pastor'
```
Ensure frontend fetches latest profile after RLS fix (call `/auth/refreshSession`).

### 10.4 Testing Sequence
1. Open `/session-debug.html` → Check Auth → Check Profile  
2. If role shows admin, open `/emergency-app-v2.html` → Admin tab should work  
3. Finally open `/` (main React) and watch console.

---

## 11  Key Files to Review First

| File Path | Purpose | Why Important | What to Check |
|-----------|---------|---------------|---------------|
| `src/pages/CharacterGrid.jsx` | Renders the list/grid of characters in the main React app. | Loads characters and displays wrong column names. | Search for `character_name`, `short_biography`, `opening_sentence` and map to `name`, `description`, `opening_line` **or** adjust via view. |
| `src/pages/ChatPage.jsx` | Handles chat UI and logic with selected character. | Uses character fields & persona prompt. | Same field-name mismatch; ensure it uses `opening_line` and `description`. |
| `src/pages/AdminDashboard/index.jsx` | Parent admin dashboard with tabs. | Admin role detection and data fetches. | Verify `isAdmin` logic and profile fetch after RLS fix. |
| `src/components/AuthProvider.jsx` *(or similar)* | Wraps app and provides auth/session context. | Where profile is pulled after login. | Ensure profile refresh after role change; call `supabase.auth.refreshSession()`. |
| `supabase/client.js` | Central Supabase client. | Contains URL/anon key and helpers. | Confirm uses new Supabase v2 API and imports. |
| `public/emergency-app-v2.html` | Stand-alone fallback app that currently works. | Good reference + immediate admin functions. | Keep as working baseline; can copy schema fixes back to React. |
| `public/session-debug.html` | Deep RLS/session tester. | Quick way to verify profile/admin status. | Use for troubleshooting after SQL fixes. |
| `src/hooks/useCharacters.ts` *(if exists)* | Central data-fetch hook. | Single point of truth for field names. | Update query fields and error handling. |
| `README.md` (root) | Setup instructions. | New contributors reference. | Add any new environment vars / build notes. |
| `vite.config.js` | Build config / public folder settings. | Ensures static HTML test tools are served. | Confirm `/public` files copied to build output. |

These files give a fast mental model of where data enters the UI, how roles are detected, and where naming mismatches occur. Review them before deeper debugging.

### END OF HANDOFF
