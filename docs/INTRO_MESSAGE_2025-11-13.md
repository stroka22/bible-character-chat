# Welcome to Bible Character Chat (FaithTalk AI)

Hi! I’m handing off the project in a ready-to-run state with a clear first task.

What to do first:
- Configure your environment variables (see the handoff doc referenced below).
- Run: `npm ci` then `npm run dev`.
- Verify the homepage loads and characters render.

Primary focus for this session:
- Resolve org‑scoped premium gating so free vs. premium characters match the admin settings across all screens. Start by reviewing:
  - `src/utils/accountTier.js`
  - `src/services/tierSettingsService.js`
  - `src/components/admin/AccountTierManagement.jsx`
  - `src/components/ScalableCharacterSelection.tsx`

Diagnostics to try in the browser console:
- `import.meta.env.VITE_OWNER_SLUG`
- Inspect/clear localStorage keys starting with `accountTierSettings:`.

Once gating is consistent, run the short regression checklist in the handoff doc.

Deep-dive details, architecture, and test plans:
- See: `docs/HANDOFF_2025-11-13.md`

No credentials are embedded in code or docs. Retrieve keys from your dashboards and set them in env vars per the handoff doc.

If you need me to expand scope (fix build, wire tests, etc.), ask and I’ll proceed on a new branch.
