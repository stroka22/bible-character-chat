# 📖 Bible Character Chat

Chat in real-time with notable figures from Scripture powered by GPT-4.  
Select **Paul**, **Moses**, **Mary Magdalene**, and many more to ask questions, explore theology, or simply enjoy a first-person perspective on biblical events.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| Character Selection | Browse/search Bible characters with avatars and summaries. |
| Persona-Driven Responses | Each character has a system prompt that shapes its unique voice and knowledge scope. |
| Streaming Chat | Answers stream token-by-token for a natural “typing” feel. |
| Context Preservation | Conversation history is stored so the model can stay on topic. |
| Typing & Error States | “_Paul is responding…_” indicator, graceful error cards with **Retry**. |
| Authentication | Email/password via Supabase Auth (anonymous usage also works). |
| Tailwind UI | Responsive chat bubbles, light mode by default. |
| Future-Ready | Hooks & DB schema prepared for **Save/Resume**, **Favorites**, voice or avatar chat. |

---

## 🏗️ Architecture Overview

```
src/
│
├── services/        # Thin wrappers around external APIs
│   ├── supabase.ts  # Supabase JS client
│   └── openai.ts    # OpenAI SDK helper & streaming
│
├── repositories/    # Data access (characters, chats, messages)
├── contexts/        # Global React Contexts (Auth, Chat)
├── components/
│   ├── CharacterSelection/  # Cards & search UI
│   └── chat/                # ChatBubble, ChatInput, ChatInterface
├── pages/           # Page-level layout (HomePage)
└── App.tsx          # Routing & providers
```

Database (Supabase PostgreSQL):

```
characters      <-- static persona metadata
chats           <-- per-user sessions
chat_messages   <-- ordered conversation log
```

Edge Functions _(optional in v1)_ will later proxy OpenAI calls to keep the API key server-side.

---

## 🚀 Getting Started

### 1. Prerequisites

* Node 20+ and npm 10+ (or pnpm/yarn)
* A Supabase project
* An OpenAI API key (GPT-4 access)

### 2. Clone & Install

```bash
git clone https://github.com/your-org/bible-character-chat.git
cd bible-character-chat
npm install          # or pnpm install
```

### 3. Environment Variables

Create `.env` in the project root:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_OPENAI_API_KEY=sk-...
```

> 🔒  In production **never** expose `VITE_OPENAI_API_KEY` to browsers.  
> Use an Edge Function or serverless API to proxy requests instead.

### 4. Database Setup

```bash
npm i -g supabase
supabase login
supabase db reset            # spins up local Postgres
supabase db push             # applies migrations in /supabase/migrations
```

### 5. Run Dev Server

```bash
npm run dev
```

Open http://localhost:5173 and start chatting! 🎉

---

## 🛠️ Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite + HMR |
| `npm run build` | Production build (`dist/`) |
| `npm run preview` | Preview dist locally |
| `supabase db push` | Apply SQL migrations locally |
| `supabase functions deploy` | Deploy edge functions (later phase) |

---

## ☁️ Deployment

1. **Frontend** – deploy `dist/` on Vercel, Netlify, Cloudflare Pages, etc.  
2. **Supabase** – push the SQL migration to your hosted DB.  
3. **OpenAI Key** – create a Supabase Edge Function (Node 18) that receives chat history, adds persona prompt, calls OpenAI, and streams the result. Store `OPENAI_API_KEY` as a secret:  
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...
   ```

---

## 🗺️ Roadmap

- [ ] Persist chat history & resume sessions
- [ ] Mark chats/characters as favourites
- [ ] Voice input & TTS output
- [ ] Animated character avatars
- [ ] Mobile PWA offline caching

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

```
git checkout -b feat/your-feature
npm run lint && npm run test
git commit -m "feat: awesome feature"
git push origin feat/your-feature
```

---

## 📄 License

MIT © 2025 Your Name / AskJesusAI Team
