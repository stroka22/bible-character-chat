# Pull Request – Conversation Persistence Feature 🚀

## 1. Overview

This PR adds **first-class conversation persistence** to Bible Character Chat.  
Users can now:

* Start a chat, leave, and come back later  
* Rename, favourite, share, soft-delete & restore conversations  
* Browse their complete history in a dedicated **My Conversations** page  
* Share read-only links with friends (no login required)

Under the hood we introduce a robust `conversations` ↔ `messages` schema with RLS, a repository & context layer, and upgraded UI/UX across chat flows.

---

## 2. Key Files Created / Modified

| Path | Purpose |
|------|---------|
| **sql/conversation_schema.sql** | Full PG/ Supabase schema ‑ tables, indexes, triggers, RLS, helper RPCs |
| **migration-conversations.js** | Node script to run the above SQL with service key |
| **src/repositories/conversationRepository.js** | All CRUD calls (create, share, soft-delete, etc.) |
| **src/contexts/ConversationContext.jsx** | React global state for conversations + helper hooks |
| **src/components/chat/ChatInterfaceWithConversations.js** | Chat UI wired to persistence (auto-save, share, favourite) |
| **src/pages/ConversationsPage.jsx** | Grid/list management UI with filters, rename, delete, share modals |
| **src/AppWithConversations.js** (plus routing wires) | Adds `/chat/:conversationId`, `/conversations`, `/shared/:shareCode` |
| **src/components/chat/ChatInput.js** | Accepts `onSendMessage` for persistence-aware sends |

*(Existing components like `ChatBubble`, `CharacterInsightsPanel`, etc. reused unchanged)*

---

## 3. Database Changes

```text
┌────────────────────────┐        ┌──────────────────────┐
│   conversations        │ 1 ── * │      messages        │
├────────────────────────┤        ├──────────────────────┤
│ id  (uuid PK)          │        │ id (uuid PK)         │
│ user_id  → auth.users  │        │ conversation_id FK   │
│ character_id → chars   │        │ role  (user/assistant)│
│ title                  │        │ content  (text)      │
│ last_message_preview   │        │ metadata  (jsonb)    │
│ is_favorite bool       │        │ is_deleted bool      │
│ is_shared  bool        │        │ created_at ts        │
│ share_code  text uniq  │        └──────────────────────┘
│ is_deleted bool        │
│ created_at / updated_at│
└────────────────────────┘
```

Highlights  
• Triggers keep `updated_at` + `last_message_preview` fresh  
• **Row-Level Security** ensures users only see their own (or shared) data  
• Helper RPCs: `soft_delete_conversation`, `restore_conversation`, `generate_share_code`  

Run the schema via _migration-conversations.js_ or copy SQL into Supabase.

---

## 4. How Reviewers Can Test

1. **DB Migration**  
   ```bash
   cp .env.example .env        # add SUPABASE_URL & SERVICE_KEY  
   node migration-conversations.js
   ```

2. **Start App**  
   ```bash
   npm install
   npm run dev
   # open http://localhost:5173
   ```

3. **Happy Path**  
   1. Log in, pick a character, send a message  
   2. Press **Save** → supply a title  
   3. Refresh page → Resume via **My Conversations**  
   4. Mark as ★ Favourite, Rename, Delete, Restore  

4. **Share Flow**  
   1. Open a conversation → **Share** → copy link  
   2. Open incognito window → URL should show read-only thread  

5. **RLS Check**  
   * Log in with second user – should _not_ see first user’s conversations  
   * Shared link still accessible

6. **Mobile / PWA sanity** – load on phone, verify responsive layout.

7. **Edge Cases**  
   * Soft delete then attempt resume (expect 404 → redirect)  
   * Long messages (>1 kB) still save & preview truncates gracefully  

---

## 5. Screenshots / Mock-ups

| View | Image |
|------|-------|
| **My Conversations** grid (desktop) | ![Conversations grid](https://dummyimage.com/800x450/0d1b2a/ffffff&text=Conversations+Grid) |
| Rename modal | ![Rename modal](https://dummyimage.com/600x350/0d1b2a/ffffff&text=Rename+Modal) |
| Share modal | ![Share modal](https://dummyimage.com/600x350/0d1b2a/ffffff&text=Share+Modal) |
| Chat header with save/share/fav buttons | ![Chat header](https://dummyimage.com/800x150/0d1b2a/ffffff&text=Chat+Header+Actions) |
| Mobile conversation list | ![Mobile list](https://dummyimage.com/375x667/0d1b2a/ffffff&text=Mobile+List) |

*(Images are mock placeholders – attach real screenshots before merge)*

---

### ✅  Ready for Review

*Focus on schema soundness, RLS, and UX polish.*  
Ping @team if you hit any issues or have improvement ideas!
