# Bible Character Chat

A web experience that lets users **chat with biblical figures** such as Jesus, Mary, Moses, Paul, and many more.  
It blends a rich character-selection UI with an AI-powered chat and an “insights” side-panel that surfaces scripture, historical context, relationships, and study questions.

---

## 🌟 Current Status

| Layer | State | Notes |
|-------|-------|-------|
| **Standalone HTML** (`public/standalone-chat.html`) | **Stable** ✅ | Complete selection grid/list, filters, chat, insights. No build step required. |
| **React app** (`src/…`) | ❌ *Won’t build* | Several TypeScript syntax errors still block `npm run build`. |
| **Backend / Supabase** | ✅ | Schema & RLS policies fixed; admin roles work. |
| **Stripe / Subscriptions** | ⚙️ *Mocked* | Placeholder keys; no live billing yet. |

---

## Documentation

- **Getting Started (user-focused):** [`docs/GettingStarted.md`](docs/GettingStarted.md)
- **Bot360AI Sales Sheet:** [`docs/SalesSheet-Bot360AI.md`](docs/SalesSheet-Bot360AI.md)

---

## 🚀 Launch the Stand-Alone Chat (Zero Dependencies)

### Quick open

```
open public/standalone-chat.html      # macOS  
start public\standalone-chat.html     # Windows  
xdg-open public/standalone-chat.html  # Linux (if xdg-open installed)
```

### Serve over HTTP (for mobiles / other devices)

```
# From repo root
./start-chat.sh --http --port=8000   # auto-uses python3 if available
# then visit http://localhost:8000/public/standalone-chat.html
```

---

## 🖼️ Key Features (textual screenshots)

1. **Header & Navigation** – Dark-blue translucent bar with gold “Bible Character Chat” logo and two tabs: *Characters* (active) & *Chat*.  
2. **Character Selection Grid** – 3 × N cards with perfectly circular 150 px portraits, character name in gold, short bio under each.  
3. **Filters Bar** – Search box, Testament toggle (All/Old/New), Book & Group dropdowns, plus Grid/List view buttons.  
4. **Alphabetical Rail** – A-Z pill buttons floating on the right for jump-to-letter filtering.  
5. **Pagination** – « 1 2 3 … » buttons centred under the grid.  
6. **Chat View** – White panel with back arrow, tiny circular avatar, character name & description, message stream, and input box with blue send button.  
7. **Insights Panel** – Slides in from right; sections for Historical Context, Scripture References (clickable chips), Relationships (pills), and Study Questions (indented italics).

---

## 🏗️ Accessing the React App (experimental)

> The React build currently fails; use only if you plan to help fix TS errors.

```
# install deps
npm install
# start with auth bypass & force-serve React (IGNORE legacy html)
./start-app.sh --skip-auth --force-react --port=5175
# open http://localhost:5175
```

If the screen is blank check browser console for TypeScript stack traces.

---

## ⚠️ Known Issues & Limitations

1. **TypeScript build errors** in `CharacterCard.tsx`, `AuthContext.tsx`, several page components.  
2. **Legacy service-workers** may still trigger redirects; run `public/service-worker-cleanup.js` or clear site data.  
3. **Stripe integration** is mocked; attempting to purchase will no-op.  
4. **AI responses** in standalone mode are **rule-based placeholders**, not actual OpenAI calls.  
5. **Mobile viewport** needs polishing—alpha navigation overlaps on very small screens.  

---

## 🔮 Future Plans

1. **Fix TS & restore full React build** (replace curly quotes, close JSX tags, run `npm run lint`).  
2. **Port standalone logic into React components** (`ScalableCharacterSelection`, `ChatPage`) for single-page delivery.  
3. **Wire genuine OpenAI streaming** (with env var `VITE_OPENAI_API_KEY`) and real Stripe checkout.  
4. **Add Pastor/Admin dashboards** for content moderation & subscription management.  
5. **Progressive-Web-App polish** – unified, clean service-worker, offline scripture cache.  
6. **Automated tests** (Playwright): select character → send message → expect response chip.  
7. **Multilingual support** starting with Spanish & Portuguese character bios.

---

🙏 **Thank you for trying Bible Character Chat!**  
Feel free to open issues or submit pull requests as we journey toward the full React release.  
