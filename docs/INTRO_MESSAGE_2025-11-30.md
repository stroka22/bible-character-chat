# Welcome, Droid — Read Me First

Start here, then open the comprehensive handoff next.

1) Read the full handoff: docs/HANDOFF_COMPREHENSIVE_2025-11-30.md
2) Clone and set up the repo: /Users/brian/bible-character-chat (GitHub: stroka22/bible-character-chat)
3) Review the open branches and PRs noted in the handoff, then run the Quick Start commands in the Setup section.
4) Do NOT commit credentials. Retrieve secrets via the owner’s secure channel (see “Secrets you must request”).

Current priorities (top of queue)
- Web: Study “Start” must reliably open Introduction (lesson 0) and the chat must follow the study prompt. Navigation back to Home must be available throughout the study (floating Home button added).
- Mobile (Expo): Validate Stage 2 features (free/premium gating, daily message limits, character gating, favorites, studies navigation). Ensure iOS and Android dev clients build and run cleanly.
- Stabilize OpenAI proxy endpoint and Supabase env usage across web and mobile.

Where code lives (high-level)
- Web app (React + Vite): src/, pages in src/pages, chat UI in src/components/chat, serverless API routes in api/.
- Mobile app (Expo SDK 54): mobile/, screens in mobile/src/screens, libs in mobile/src/lib, config in mobile/app.json and mobile/eas.json.

Secrets you must request (do not store in repo)
- OpenAI: OPENAI_API_KEY (server-side only; used by api/openai/chat.mjs)
- Supabase: URL + anon key for current org
- Stripe: secret keys for billing portal and checkout (if used in production)
- Expo/EAS: project access and build credentials as needed

Immediate first tasks
- Follow the “Local Setup” and “Mobile Dev Client” steps in the handoff.
- Verify: Study Introduction (lesson 0) renders and chat is guided by the study prompt.
- Verify: iOS/Android dev clients open, login succeeds, gating and daily limits behave as configured.

If blocked
- See Troubleshooting in the handoff for Metro, EAS, or env issues.

Next: Open docs/HANDOFF_COMPREHENSIVE_2025-11-30.md
