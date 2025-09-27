 # Next Session Kickoff — FaithTalkAI
 
 Welcome! This repo powers FaithTalkAI.com.
 
 Start here:
 1) Read docs/Comprehensive-Handoff-2025-09-27.md end-to-end
 2) Copy `.env.example` → `.env` and fill `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_OPENAI_API_KEY`
 3) `npm ci && npm run dev` then complete the Testing Checklist in the handoff
 4) Verify Supabase RLS (user/admin/superadmin) and Studies → Chat auto-intro/auto-save
 5) Open PRs for fixes; keep commits small and focused
 
 Current focus:
 - Validate Guided Studies flow (auto-intro + auto-save)
 - Confirm Roundtable Settings + Account Tier admin tabs
 - Ensure message-limit/premium gating shows friendly upsell
 - Reconfirm no layout overlap on admin pages
 
 Roadmap highlights:
 - Zoom-like live video/audio with characters (WebRTC)
 - Deep research tools (sources, citations, historical formation)
 - Multi-language models + localized UI
 - Sermon-series creation toolkit for pastors
 
 Thank you — ship with care and test thoroughly.