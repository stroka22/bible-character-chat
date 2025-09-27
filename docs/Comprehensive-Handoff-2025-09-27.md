 # FaithTalkAI — Master Handoff (2025-09-27)
 
 Owner: Brian (stroka22)
 Local repo: `/Users/brian/bible-character-chat`
 GitHub: https://github.com/stroka22/bible-character-chat
 Hosting: Vercel (builds `main`)
 Core Services: Supabase (Auth/DB/RLS/Storage), OpenAI (LLM)
 Frontend: Vite + React + React Router + Tailwind
 Node: >= 18
 
 This is the single source of truth for architecture, env, features, status, testing, and roadmap. Read fully before changes.
 
 ---
 
 ## 1) System overview and interactions
 - React SPA served by Vercel
 - Supabase provides auth (email/password), Postgres storage, RLS policies, and storage (avatars/images)
 - Chat flows call OpenAI for assistant responses
 - Repositories encapsulate CRUD; RLS guards ensure proper role access (user/admin/superadmin)
 
 ---
 
 ## 2) Code map — where to look
 - Entry: `index.html`, `src/main.jsx`, router: `src/App.jsx`
 - Layout: `src/components/layout/*`
 - Character selection: `src/components/ScalableCharacterSelection.jsx` (legacy: `CharacterSelection.tsx`)
 - Chat: `src/components/chat/*` (e.g., `SimpleChatWithHistory.js`, `ChatBubble.jsx`, `ChatInput.jsx`, `ChatActions.jsx`)
 - Contexts: `src/contexts/*` (AuthContext.jsx, ChatContext.jsx, ConversationContext.jsx)
 - Repositories: `src/repositories/*` (characters, groups, conversations, bible studies)
 - Studies: `src/pages/StudiesPage.jsx`, `src/pages/StudyLesson.jsx`, repo: `src/repositories/bibleStudiesRepository.js`
 - Roundtable: `src/pages/RoundtableSetup.jsx`, `src/pages/RoundtableChat.jsx`
 - Admin: `src/pages/AdminPage.jsx` (tabs: Studies, Roundtable Settings, Account Tier)
 - Public assets/config: `tailwind.config.js`, `public/*`
 - Docs: see root docs (HANDOFF.md, START_HERE.md, TESTING_CHAT.md, etc.) and this file
 
 ---
 
 ## 3) Environment configuration
 - Copy `.env.example` → `.env` at repo root
 - Required keys:
   - `VITE_SUPABASE_URL=`
   - `VITE_SUPABASE_ANON_KEY=`
   - `VITE_OPENAI_API_KEY=`  (development convenience; in production, proxy server is recommended)
 - Vercel: mirror env vars in Project Settings (Production + Preview)
 - Supabase: roles via profile table + helper functions; seed admins as needed
 
 ---
 
 ## 4) Install, run, build
 ```bash
 npm ci
 npm run dev       # http://localhost:5173/
 npm run build
 npm run preview
 ```
 
 ---
 
 ## 5) Roles and features (complete list)
 
 Superadmin
 - Cross-org visibility where allowed by RLS helper functions
 - Admin pages accessible; users page fixes (back-link, padding)
 
 Admin
 - Bible Studies management (studies + lessons CRUD)
 - Roundtable Settings tab in Admin
 - Account Tier management (label/heading dynamic)
 
 User
 - Character conversations: select character, chat with typing indicator and retry
 - Conversation history: auto-title/save, rename, delete, favorite, share (Web Share / copy link)
 - Guided Studies: deep-link `?study=<id>&lesson=<ix>` injects context into chat, auto-intro, auto-save of first message
 - Roundtable: setup and multi-assistant chat shell
 - Gating: message-limit/premium-character friendly upsell
 - Marketing/Info pages: How It Works (with User Features), FAQ, About, Pricing (if enabled)
 
 Implementation notes
 - `ChatContext` orchestrates chat state and OpenAI requests; exposes `postAssistantMessage` to trigger intros
 - `SimpleChatWithHistory.js` implements auto-intro + auto-save for study deep-links
 - `bibleStudiesRepository.js` strips falsy `id` on upsert to avoid NOT NULL violations
 - RLS uses `public.current_user_role()` and `public.current_user_owner_slug()` for safe scoping
 
 ---
 
 ## 6) Current status
 - Production (Vercel) is live on FaithTalkAI.com
 - Recent fixes merged: null-id upsert; admin padding/link; Roundtable tab; study auto-intro/auto-save; friendly upsell; admin spinner auto-refresh with retry UI and superadmin support
 - Character visibility and RLS validated; CSV import/export utilities exist in repo for maintenance
 
 ---
 
 ## 7) Testing checklist (run before shipping)
 - Auth: sign-up, sign-in, sign-out; password reset redirect
 - Character selection: grid/list; featured character behavior
 - Chat: send messages, typing indicator, retry; history save/rename/delete/favorite; share link
 - Guided Studies: open via Studies page; deep-link to StudyLesson → auto-intro message → confirms auto-save
 - Roundtable: setup → chat shell
 - Admin: Studies CRUD; Roundtable Settings tab; Account Tier panel presence and headings
 - RLS: verify admin/superadmin access vs user; ensure users cannot bypass policies
 - Layout: no header overlap; proper page padding; mobile/desktop check
 
 ---
 
 ## 8) Operational guidance
 - Never hardcode Supabase project refs/keys; use `.env`
 - When using root scripts or HTML bypass tools, load configuration via dotenv and placeholders only (no live credentials committed)
 - Prefer failing closed (obvious placeholder) over accidental writes to wrong project
 
 ---
 
 ## 9) Roadmap (next improvements)
 - Live video/audio (Zoom-like) discussions with Bible characters (WebRTC)
 - Deep research tools: source retrieval, citation viewer, and background on biblical text formation
 - Multi-language model support + localized UI
 - Sermon-series creation toolkit for pastors (outline, scripture sets, media plan)
 - PWA polish: icons/manifest/offline caching
 
 ---
 
 ## 10) Kick-start for the next Droid
 1) Clone/pull repo, create `.env` from `.env.example`, fill Supabase/OpenAI keys
 2) `npm ci && npm run dev` — walk through Testing checklist end-to-end
 3) Review code: Contexts (Auth/Chat/Conversation), repositories, Admin pages, Studies and Chat integration
 4) Verify RLS using helper functions; confirm admin/superadmin roles behave correctly
 5) File issues for UX polish or bugs; open PRs with small, focused commits
 
 Welcome aboard — read thoroughly, test thoroughly, and ship confidently.
