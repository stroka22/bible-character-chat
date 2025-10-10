# Bible Character Chat – Comprehensive Handoff (2025-10-10)

Welcome, fellow Droid — we’re glad you’re here. This handoff is designed to get you productive fast with full context, clear priorities, and a secure environment. If anything is unclear, prioritize reading this document, reviewing the code paths listed, and validating the production environment and migrations.

Owner: stroka22  •  Repo: https://github.com/stroka22/bible-character-chat

This document provides the end-to-end context for the next engineer ("Droid") to continue development seamlessly. It covers architecture, tooling, environment and secrets management (no secrets included), implemented features, current status, known issues, active work, testing plans, and roadmap.

Note on credentials: This document never includes live credentials or secrets. Manage secrets via Vercel and GitHub Environments as described below. Rotate compromised keys immediately.

---

## 1) Where to Find Things

- Source code (local): `/Users/brian/bible-character-chat`
- GitHub repo (origin): `https://github.com/stroka22/bible-character-chat`
- Primary runtime: Vercel (Production + Preview)
- Serverless functions: `api/` (Vercel)
- Web client: `src/`
- Database: Supabase Postgres
- Migrations: `supabase/migrations/`
- GitHub Actions (CI): `.github/workflows/`
- Security/Env guidance: see Section 5

Important entry points/files:
- Server OpenAI proxy: `api/openai/chat.mjs` (uses server-side `OPENAI_API_KEY`)
- Roundtable chat UI: `src/pages/RoundtableChat.jsx`
- Roundtable context: `src/contexts/RoundtableContext.jsx`
- Simple chat: `src/components/chat/SimpleChatWithHistory.js`
- Conversation context: `src/contexts/ConversationContext.jsx`
- Repositories (DB access):
  - `src/repositories/conversationRepository.js`
  - `src/repositories/chatRepository.js`
  - `src/repositories/userFavoritesRepository.js`
- Character selection and favorites: `src/components/ScalableCharacterSelection.tsx`
- My Walk page (sorting, favorites visibility): `src/pages/MyWalkPage.jsx`
- CI migrations workflow: `.github/workflows/supabase-migrations.yml`

## 2) Software Stack and Interactions

- Frontend: React (Vite), TypeScript (some files), JS
- Serverless API: Vercel functions under `api/`
- Database: Supabase (Postgres + Auth + Row Level Security)
- Auth: Supabase
- OpenAI: Accessed only server-side via `api/openai/chat.mjs`; client never holds key
- CI/CD: GitHub Actions (optional Supabase migrations push), Vercel auto-deploys

Interaction flow (typical chat):
1) Client sends chat messages to `api/openai/chat.mjs`.
2) Serverless function enriches with a system message and calls OpenAI using `process.env.OPENAI_API_KEY`.
3) Response returned to client; repositories persist conversations/messages in Supabase.
4) Share and Roundtable features control routing and visibility, including anonymous shared views.
