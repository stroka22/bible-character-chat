# FaithTalkAI — Bible Character Chat (Comprehensive Handoff)

Owner: Brian (stroka22)  
Local path: `/Users/brian/bible-character-chat`  
GitHub: <https://github.com/stroka22/bible-character-chat>  
Runtime: Vite + React + React Router + Tailwind  
Key services: Supabase (Auth / DB / RLS), OpenAI (LLM)  

---

## 1) What this app is
Production Bible-study / chat application that lets users  
• Select a biblical character and chat (guided, context-aware)  
• Start **Roundtable** discussions (multi-character)  
• Take **Guided Bible Studies** (study → lesson → auto-intro & Q-A)  
• Save, rename, favorite & share conversations  
• Administer content and access via **Admin** / **Superadmin** features  

---

## 2) Where to find things

| Area | Path |
|------|------|
| Entry | `index.html`, `src/main.jsx`, router `src/App.jsx` |
| Layout | `src/components/layout/*` |
| Character chooser | `src/components/ScalableCharacterSelection.jsx` (fallback `CharacterSelection.tsx`) |
| Chat | `src/components/chat/*` (`SimpleChatWithHistory.js`, `ChatBubble.jsx`, `ChatInput.jsx`, `ChatActions.jsx`) |
| Contexts | `src/contexts/*` (`AuthContext.jsx`, `ChatContext.jsx`, `ConversationContext.jsx`) |
| Studies | `src/pages/StudiesPage.jsx`, `StudyLesson.jsx`, repo `src/repositories/bibleStudiesRepository.js` |
| Roundtable | `src/pages/RoundtableSetup.jsx`, `src/pages/RoundtableChat.jsx` |
| Admin | `src/pages/AdminPage.jsx` (tabs), Superadmin users page |
| Data Repos | `src/repositories/*` (characters, groups, studies, conversations) |
| RLS SQL | Supabase SQL Editor – policies use `public.current_user_role()` + `public.current_user_owner_slug()` |

---

## 3) Environment & configuration

Local example: `.env`

Required keys  
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENAI_API_KEY=      # dev only – use Edge/CF proxy in prod
```

Supabase  
• Auth: email / password  
• Core tables: `profiles`, `characters`, `conversations`, `messages`, `bible_studies`, `bible_study_lessons`, …  
• RLS: helper functions above; promote admins via SQL or seed scripts.

Deployment: Vercel → builds **main** branch; same env vars set in dashboard.

---

## 4) Install, run, build
```bash
npm install
npm run dev      # http://localhost:5173/
npm run build
npm run preview
```

---

## 5) Roles & features (current)

### Superadmin
* Global admin pages across orgs  
* Users page (back-link & padding fixed)  
* RLS bypass via org-scoped helper functions  

### Admin
* Bible Studies CRUD (studies + lessons)  
* **Roundtable Settings** tab in Admin nav  
* **Account Tier Management** (heading dynamic via `mode` prop)  

### User
* **Character Conversations** – select, chat, typing indicator, retry  
* **Conversation History** – save (auto-title), rename, delete, favorite  
* **Sharing** – Web Share / copy link  
* **Guided Studies** – deep-link injects context; auto-intro; auto-save  
* **Roundtable Discussions** – setup + chat shell  
* Message-limit & premium-character gating with friendly upsell copy  

---

## 6) Important implementation details
* `ChatContext.jsx` – orchestrates messages, gating, save/favorite; exposes `postAssistantMessage` for auto-intros.  
* `SimpleChatWithHistory.js`  
  * Auto-save when launched from study link  
  * Auto-intro summarises study/lesson (scripture, outline, warm question)  
  * Handles `?study=<id>&lesson=<ix>` and `?character=<id>`  
* `bibleStudiesRepository.js` – strips falsy `id` on upsert (avoids NOT NULL violation).  
* RLS policies call helper functions rather than raw JWT role.  
* Admin nav – Roundtable tab inserted between Studies & Tiers; heading dynamic.

---

## 7) Known branches & status
* **main** – production (Vercel) – stable  
* Merged **fix/** branches: null-id upsert, admin padding, roundtable tab, auto-intro, message-limit copy  

---

## 8) Current issues / testing / WIP
1. Verify Studies → Chat auto-intro & auto-save flows  
2. Confirm RLS access for admin/superadmin across orgs  
3. QA Roundtable Setup/Chat UX + admin Roundtable settings  
4. Test free-tier message limit & premium-character gating  
5. Ensure production uses `ScalableCharacterSelection` (not legacy)  

---

## 9) Future improvements (roadmap)
* Video & audio (Zoom-like) live discussions with Bible characters  
* Deep research tools (source links, scripture-formation history)  
* Multi-language model + localized UI  
* Sermon-series creation toolkit for pastors  

---

## 10) Kick-start checklist for the next Droid

1. `git clone`, `git pull`, `npm install`  
2. Populate `.env` with Supabase & OpenAI keys  
3. `npm run dev` → test flows: character chat, studies, roundtable, history, admin pages  
4. Review `ChatContext.jsx`, `SimpleChatWithHistory.js`, Admin pages, repositories  
5. Validate Supabase RLS & helper functions  
6. File issues / PRs for any bugs or UX polish; proceed with roadmap  

Welcome aboard — read the code thoroughly, follow the checklist, and keep shipping high-quality features!
