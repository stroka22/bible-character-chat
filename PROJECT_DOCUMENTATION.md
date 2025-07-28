# Bible Character Chat – Project Documentation  
_Last updated: July 28 2025_

---

## 1. Project Overview
Bible Character Chat (a.k.a. FaithTalkAI) is a React + Vite single-page application that lets users chat with AI-powered biblical characters.  
Core goals:
* Provide engaging, scripture-based conversations.
* Offer a freemium model with optional premium subscription (Stripe).
* Support rich admin tooling so non-developers can curate content.

---

## 2. Key Features & Functionality
1. Character catalogue with search, hover animations and featured character.  
2. Real-time chat interface with conversation history and shareable links.  
3. Favorites system (star icon) with dedicated `/favorites` page.  
4. Message timestamps, local share code, and debug tools.  
5. Premium controls: free character/message limits, upgrade modal, Stripe checkout.  
6. Admin panel (tabbed) for:
   * Featured Character
   * User Favorites stats
   * FAQ editor
   * Account Tier Management  
7. Responsive Header/Footer with FaithTalkAI branding.  
8. FAQ page (`/faq`) consuming same data as admin FAQ editor.  
9. Progressive-web-app assets and interceptor for offline / network debug.

---

## 3. Technical Architecture
```
Vite (React 18) ─┬─ AuthProvider (Supabase)
                 ├─ ConversationProvider
                 ├─ ChatProvider  (LLM API wrapper)
                 ├─ Global Header / Footer
                 └─ React-Router v6
```
• State is mostly React context + localStorage for speedy UX.  
• Chat requests hit `/functions/chat` (Supabase Edge) but are proxied in development.  
• Stripe client used for checkout, Supabase Edge function creates sessions securely.

---

## 4. File Structure & Code Organization (high-level)
```
src/
 ├─ App.js                 – routing & provider hierarchy
 ├─ main.js                – Vite entry, SW cleanup, interceptor
 ├─ components/
 │   ├─ Header.jsx / Footer.jsx / FaithLogo.jsx
 │   ├─ CharacterCard.jsx
 │   ├─ modals/UpgradeModal.jsx
 │   ├─ chat/…              (ChatBubble, ChatInterface, MessageLimitHandler)
 │   └─ admin/…             (AdminFeaturedCharacter.jsx, AdminFAQEditor.jsx,
 │                            AdminFavorites.jsx, AccountTierManagement.jsx)
 ├─ pages/
 │   ├─ HomePage.jsx
 │   ├─ PricingPage.js (static import of public/pricing.html)
 │   ├─ FavoritesPage.jsx
 │   ├─ ConversationsPage.jsx
 │   ├─ FAQPage.jsx
 │   └─ AdminPage.js
 ├─ contexts/
 │   ├─ AuthContext.jsx
 │   ├─ ChatContext.jsx
 │   └─ ConversationContext.jsx
 ├─ repositories/characterRepository.js   – abstraction over fetch / Supabase
 ├─ services/
 │   ├─ stripe.js          – client helpers
 │   └─ import-services.js – tree-shaking aggregator
public/
 └─ pricing.html           – marketing page copy of plans
```

---

## 5. Authentication System
* **Provider:** `AuthProvider` wraps the app; uses Supabase JS v2.  
* **AuthContext.jsx** exposes `user`, `loading`, `isAuthenticated`, `login`, `signup`, `logout`.  
* Components must call `useAuth()`; header has a fail-safe wrapper to avoid crashes when provider missing (graceful guest view).  
* Protected routes implemented via `<ProtectedRoute>` in `App.js`.

---

## 6. Conversation / Chat System
* `ChatProvider` handles API calls, message streaming, optimistic UI.  
* `SimpleChatWithHistory` is the main interface; wrapped by `ConversationProvider` for persistence.  
* `MessageLimitHandler` sits inside chat to watch free-tier message count and trigger `UpgradeModal` when limit reached.  
* Shareable conversations: `/shared/:shareCode` route renders in read-only mode.

---

## 7. Character Management
* Characters loaded via `characterRepository.getAll()` (currently local JSON → Supabase table ready).  
* `CharacterCard` shows avatar, bible book badge, premium flag.  
* Favorites: star icon toggles `favoriteCharacters` array in localStorage.  
* Featured character: bookmark icon saves `featuredCharacter` (name) in localStorage and shows highlight on home page.

---

## 8. Premium Features Implementation
### Account Tier Settings  
`AccountTierManagement.jsx` (admin) stores:
* `freeMessageLimit`
* `freeCharacterLimit`
* `freeCharacters` (array of character IDs)  
Stored in `localStorage.accountTierSettings`.

### Enforcement  
* **Character gating:** `CharacterCard` checks `isPremiumOnly()` vs `hasPremiumAccess()` (simple admin=true placeholder). If blocked, shows Upgrade modal or “Upgrade to Access” CTA.  
* **Message limit:** `MessageLimitHandler` monitors count per conversation, displays modal at limit.  
* Upgrade flow: `UpgradeModal` → `/pricing` → Stripe checkout.

---

## 9. Admin Panel
Route: `/admin` (Protected). Tabs:
1. Featured Character
2. User Favorites analytics
3. FAQ Editor (CRUD, visibility toggle, saved to `faqItems` in localStorage)
4. Account Tier Management  
Uses Tailwind UI, persists to localStorage, ready for Supabase migration.

---

## 10. Third-Party Integrations
• **Supabase**  
  – Auth, Edge Functions, future Postgres tables.  
  – Keys stored in `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

• **Stripe**  
  – Checkout via `stripe.js` service.  
  – Env: `VITE_STRIPE_PUBLIC_KEY`, `VITE_STRIPE_PRICE_MONTHLY`, `VITE_STRIPE_PRICE_YEARLY`.  
  – Edge function (Supabase) creates server-side session.

• **GitHub**  
  – Repo: `https://github.com/stroka22/bible-character-chat` (main branch).  
  – Commits follow conventional messages for traceability.

---

## 11. Deployment Instructions
1. **Prerequisites**  
   * Node ≥ 18, PNPM/NPM, Supabase project, Stripe account, GitHub Actions (optional).  
2. **Environment**  
   ```
   cp .env.example .env
   # fill Supabase + Stripe keys
   ```
3. **Local build**  
   ```
   npm install
   npm run build   # output in dist/
   ```
4. **Production hosting**  
   • Any static host (Vercel, Netlify, Cloudflare Pages).  
   • Ensure `/_supabase/functions/*` proxy to Supabase Edge.  
5. **Supabase**  
   ```
   supabase functions deploy chat
   supabase db push   # if using Postgres tables
   ```
6. **Domain + HTTPS**  
   Point DNS → host; for Stripe live keys HTTPS is mandatory.

---

## 12. Pending Tasks & Future Improvements
* Replace localStorage persistence with Supabase tables for multi-device sync.  
* Implement real subscription check (webhook → Supabase `user_subscriptions`).  
* Add search / filter on Character list.  
* Complete Profile & Settings pages.  
* Accessibility pass (ARIA labels, keyboard nav).  
* Unit tests (Jest + React Testing Library).  
* CI/CD pipeline with GitHub Actions -> Vercel preview deploys.  
* Migrate debug interceptor to feature-flag.

---

## 13. Troubleshooting Common Issues
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `useAuth must be used within an AuthProvider` | Header rendered outside provider | Ensure `<AuthProvider>` wraps app; do not manually mount Header in `main.js`. |
| Stripe checkout returns 400 | Wrong price IDs / live key mismatch | Verify `.env` values match products in Stripe dashboard. |
| Bible book badge overlaps avatar | Ensure latest `CharacterCard.jsx` (badge moved below image). |
| Favorites page empty | `favoriteCharacters` key cleared; add favorites again. |
| Upgrade modal not showing | Check `accountTierSettings` exists and character is premium in list. |
| Port 5173 busy on dev start | Another Vite instance running | `lsof -i :5173` then `kill PID`. |

---

_This document should give the next developer a rapid orientation. For any unanswered questions, check inline code comments and commit history. Happy coding!_
