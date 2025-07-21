# START_HERE.md  
Quick-Start Guide for **Bible Character Chat**

---

## 1. What is Bible Character Chat?
An interactive web app that lets users “chat” with Biblical figures powered by OpenAI.  
Features include:  
• Free limited chat (5 msgs / major characters)  
• Premium subscription via Stripe (monthly / yearly)  
• Rich “insights” side-panel (history, scripture, relationships)  
• Supabase auth (email / magic-link) & role-based admin  
• Admin dashboard with CSV bulk upload of characters / groups  

---

## 2. Run the App Locally

```bash
git clone <repo>
cd bible-character-chat
pnpm i                   # or npm install
cp .env.example .env     # add keys – see below
npm run dev              # Vite dev server (default http://localhost:5173)
```

Required `.env` keys  
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
***REMOVED***
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_YEARLY=price_...
VITE_SUPABASE_PROJECT_REF=<ref>
# Dev helpers
VITE_SKIP_AUTH=true      # bypass auth in development
```

Build & preview production bundle:

```bash
npm run build
npm run preview -- --port 5180
```

---

## 3. Key Code Locations

| Feature | File/Folder |
| ------- | ----------- |
| Routing / Providers | `src/App.js` |
| Header & navigation | `src/components/layout/Header.js` |
| Home / free chat page | `src/pages/HomePage.js` |
| Chat interface | `src/components/chat/ChatInterface.js` |
| Insights side-panel | `src/components/chat/CharacterInsightsPanel.js` |
| Admin dashboard | `src/pages/AdminPage.js` |
| CSV parse helper | _inside_ `AdminPage.js` (`parseCSV`) |
| Stripe service | `src/services/stripe.js` |
| Supabase wrapper | `src/services/supabase.js` |
| Mock data (offline dev) | `src/data/mockCharacters.js`, `src/data/mockGroups.js` |

---

## 4. Common Development Tasks

| Task | How-to |
| ---- | ------ |
| **Add a new Bible character** | CSV bulk upload (see §5) **or** POST via Supabase table `characters`. |
| **Tweak free-tier limits** | Edit `FREE_MESSAGE_LIMIT` constant in `src/contexts/ChatContext.js`. |
| **Styling / theme** | Most screens use Tailwind utility classes inline. Global tweaks: `src/App.css`. |
| **Skip auth during dev** | Set `VITE_SKIP_AUTH=true` in `.env` then refresh. |
| **Run lint / format** | `npm run lint` (eslint) & `npm run format` (prettier). |
| **Debug env & endpoints** | Visit `/debug` route – shows Stripe/Supabase diagnostics. |

---

## 5. QA / Feature Testing

### 5.1 Admin CSV Upload
1. Login as admin **or** keep `VITE_SKIP_AUTH=true`.  
2. Navigate to `/admin` (Header → **Admin Panel**).  
3. Under **Bulk Upload Characters (CSV)** choose a file with headers:

```
character_name,short_biography,description,persona_prompt,is_visible
```
*(full header list in AdminPage comment block).*

4. Successful rows will appear immediately in the character list.

### 5.2 Stripe Checkout (TEST mode)
1. Ensure Stripe `pk_test_` key + test price IDs are in `.env`.  
2. Go to `/pricing`.  
3. Pick **Monthly** or **Yearly** ➜ **Upgrade to Premium**.  
4. Use any Stripe test card (e.g. `4242 4242 4242 4242  04/34  111`).  
5. After payment, you’re redirected to `/conversations?checkout=success`.

Use `/pricing?checkout=true&period=monthly` in URL to auto-start checkout (handy for repeat tests).

### 5.3 Navigation & Hidden Routes
If you do **not** see links:  
1. Make sure `Header` is rendered (it is included in `App.js`).  
2. Resize ≥ 640 px for full link set; on very small screens, links wrap below logo.  
3. Admin link appears only when  
   * user has `role='admin'` in Supabase **or**  
   * `VITE_SKIP_AUTH=true`.

Manual routes you can hit directly:
```
/login        /signup
/admin        /pricing
/conversations
/debug
```

---

## 6. Typical Dev Flow

1. `npm run dev` – code changes hot-reload.  
2. Update UI or logic → see instant results.  
3. Run `npm run build && npm run preview` to sanity-check production bundle.  
4. Commit & push (PR triggers CI build).

---

## 7. Need Help?

* Design reference: `chat-with-insights-mockup.html`.  
* Handoff doc with deep details: **HANDOFF.md**.  
* Ping **@Brian** on Slack for domain context.  

Happy coding! 🙌
