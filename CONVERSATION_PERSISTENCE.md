# Conversation Persistence Guide

This document explains how the **Conversation Persistence** feature is implemented in Bible Character Chat and how you can install, use, and extend it.

---

## 1 · Feature Overview & Benefits

| What it is | Why it helps users | Why it helps devs |
|------------|-------------------|-------------------|
| Persists every chat session (conversation metadata + individual messages) in Supabase | • Users can leave and pick up a dialogue later  <br>• They can favourite, rename, delete or share conversations | • Centralised relational data  <br>• Easy to query for analytics  <br>• Clean API surface via repository layer |

Additional perks  
• Soft-delete allows recovery of accidental deletes  
• Share codes let users publish read-only versions of a conversation without exposing their account  
• RLS keeps data private by default

---

## 2 · Installation & Setup

1. **Pull the code**

   ```
   git clone https://github.com/your-org/bible-character-chat.git
   cd bible-character-chat
   ```

2. **Environment variables**

   Duplicate `.env.example` → `.env` and supply:

   ```
   SUPABASE_URL=…
   SUPABASE_SERVICE_KEY=…  # service_role or admin key **NOT** anon
   ```

3. **Run the migration script**

   ```
   npm install           # installs @supabase/supabase-js + dotenv
   node migration-conversations.js
   ```

   The script executes `sql/conversation_schema.sql` which:

   • Creates `conversations` and `messages` tables  
   • Adds indexes, triggers and helper functions  
   • Enables Row-Level Security with strict policies

4. **Start the app**

   ```
   npm run dev
   # or
   ./start-app.sh --port 5173
   ```

5. **Open the UI**

   - http://localhost:5173  
   - Sign-in, select a character, chat, then visit **My Conversations**.

---

## 3 · Database Schema Explained

### conversations

| column | type | notes |
|--------|------|-------|
| id | uuid PK | `gen_random_uuid()` |
| user_id | uuid FK → `auth.users(id)` | owner |
| character_id | uuid FK → `characters(id)` | which bible character |
| title | text | user-editable |
| is_favorite | boolean | quick filter |
| is_shared | boolean | public toggle |
| share_code | text UNIQUE | 10-char token |
| last_message_preview | text | auto updated trigger |
| is_deleted / deleted_at | soft delete |
| created_at / updated_at | auto timestamps |

Triggers  
`update_conversation_last_message` refreshes preview + `updated_at` whenever a new message is inserted.

### messages

| column | type | notes |
|--------|------|-------|
| id | uuid PK |
| conversation_id | FK → `conversations` |
| role | text CHECK `'user' \| 'assistant'` |
| content | text | body |
| metadata | jsonb | open-ended (citations, emotions…) |
| is_deleted / deleted_at | soft delete |
| created_at | timestamptz |

### Row-Level Security

* Conversation readable by: owner, `admin`, `pastor`, or anyone if `is_shared=true`
* Messages inherit permission via a sub-query on their parent conversation
* Mutations allowed only to owner or higher role

---

## 4 · Component Architecture

```
AuthProvider
└─ ConversationProvider   ← NEW
   ├─ conversationRepository  ↔ Supabase
   ├─ ConversationsPage       (grid/list of chats)
   └─ ChatInterfaceWithConversations
        ├─ ChatInput
        ├─ ChatBubble
        └─ CharacterInsightsPanel
```

• **conversationRepository.js** – all DB calls (create, fetch, share, delete…)  
• **ConversationContext.jsx** – global React state (conversations[], activeConversation, CRUD helpers)  
• **ChatInterfaceWithConversations.js** – upgraded chat UI that calls `addMessage()` after each send  
• Routing additions  
  ```
  /chat                  – new chat (unauth allowed)  
  /chat/:conversationId  – resume saved chat  
  /conversations         – list and manage  
  /shared/:shareCode     – public read-only view
  ```

---

## 5 · Usage Examples

### A. Start & Auto-save

```js
const { createConversation, addMessage } = useConversation();

// user picks a character and types first question
await createConversation(character.id);   // returns conversation
await addMessage("Hello Abraham!", "user");
```

### B. Resume

```js
navigate(`/chat/${conversation.id}`);
```

The route loader calls `fetchConversationWithMessages()` and renders the history.

### C. Rename & Favourite

```js
await updateConversation(conversation.id, { title: "Genesis Q&A" });
await updateConversation(conversation.id, { is_favorite: true });
```

### D. Share

```js
const code = await shareConversation(conversation.id);
// share link: `${origin}/shared/${code}`
```

### E. Soft Delete

```js
await deleteConversation(conversation.id);  // moves to trash
```

---

## 6 · Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Failed to execute SQL` during migration | Using **anon** key | Use `SUPABASE_SERVICE_KEY` |
| 403 errors when saving messages | RLS policies not applied | Re-run migration script; ensure auth.uid() matches profile row |
| Conversations not appearing | `is_deleted` flag accidentally set | Call `restore_conversation(uuid)` RPC |
| Share link 404 | `is_shared` turned off later | Regenerate share code or toggle sharing again |
| Timestamps wrong time-zone | Supabase set to UTC | Convert client-side or alter `created_at` with `AT TIME ZONE` |

---

## 7 · Future Enhancements

1. **Real-time Sync**  
   Subscribe to Supabase `realtime` channel → live update messages across devices.

2. **Pagination & Lazy Load**  
   Infinite scroll older messages with `range()` query.

3. **Export / Import**  
   Allow users to download entire conversation as Markdown or JSON.

4. **Multi-user Threads**  
   Extend schema to allow group Bible study where multiple users join one conversation.

5. **Analytics Dashboard**  
   Visualise most-discussed characters, heat-maps of activity.

6. **End-to-End Encryption**  
   Encrypt message content client-side for privacy-sensitive chats.

7. **Vector Search**  
   Embed messages and allow semantic search across a user’s history.

---

**Enjoy persistent, searchable, shareable conversations!**  
Questions? Open an issue or ping the maintainers. 
