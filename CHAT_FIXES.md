# Chat Functionality Fixes & Testing Guide

_Last updated: July 2025_

## 1 ▪ Why chats were failing

1. **Silent OpenAI Failure**  
   The front-end relied solely on OpenAI. If the API key was missing, invalid, or the network request failed, the promise rejected and `ChatContext` surfaced a generic “Sorry, something went wrong” message.

2. **Incomplete Error Handling**  
   `ChatContext.sendMessage` swallowed some errors, leaving an empty assistant message that triggered the fallback banner.

3. **No Offline / Free-tier Experience**  
   Without an API key, users could not test chat at all.

## 2 ▪ What was fixed

| Area | Fix | Key Files |
|------|-----|-----------|
| OpenAI service | • Added `OPENAI_ENABLED` check<br>• Wrapped every OpenAI call in `try/catch` and unified error surface | `src/services/openai.js` |
| Local Mock System | • Generated rich, character-specific mock responses (`generate_mock_responses.js` → `mockResponses.json`) <br>• Implemented `mockResponseService.js` with topic analysis and streaming simulation | `src/services/mockResponseService.js` |
| Streaming Fallback | `streamCharacterResponse` now automatically switches to mock streaming when the API is disabled or errors | `src/services/openai.js` |
| Chat Context | • Preserves message list on error (`setMessages(prev => prev.slice(0, -1))` logic fixed)<br>• Added `retryLastMessage` helper used by the UI | `src/contexts/ChatContext.js` |
| UI Messaging | Error banner now clarifies the root cause and offers a “Retry” button that calls `retryLastMessage()` | `src/components/chat/ChatInterface.js` |
| Developer Utilities | Script `create_working_characters.js` ensures visible demo characters with verified images | `/scripts/create_working_characters.js` |

## 3 ▪ Environment prerequisites

1. **Supabase**  
   `.env` already contains working project URL and anon key. No action required unless you rotated keys.

2. **OpenAI (optional)**  
   If you have an API key:  
   ```bash
   echo "VITE_OPENAI_API_KEY=sk-…" >> .env
   ```  
   If you *do not* have a key, chats will still work using the mock response engine.

## 4 ▪ How to build & run

```bash
# from project root
npm install         # only needed the first time
npm run build
npm run preview -- --port 5186
# open http://localhost:5186
```

The build step embeds the updated OpenAI/mock logic; preview serves the compiled app.

## 5 ▪ Testing the fixes

1. **Confirm characters appear**  
   On the Home page you should see “Jesus (Final)”, “Paul (Final)”, and “Moses (Final)” cards with avatars.

2. **Open a chat**  
   Click one of the characters. The chat view opens with the character’s opening line.

3. **Send a message**  
   Type *“What is faith?”* and press Enter.  
   • With a valid OpenAI key you’ll see a streamed response from GPT-4.  
   • Without a key you’ll see a streamed mock response (words appear gradually).

4. **Force an error (optional)**  
   Temporarily rename `VITE_OPENAI_API_KEY` in `.env` and restart `npm run preview`.  
   - The first request will fail → mock fallback kicks in automatically.  
   - No “Something went wrong” banner should appear.  
   - Restore the key and restart to resume GPT responses.

5. **Retry button**  
   If an actual network outage occurs you will still see the error banner with a **Retry** button. Click it—the last user message is resent and the assistant response resumes (via OpenAI if available or mock if not).

6. **Typing indicator**  
   Observe the animated “typing dots” whenever the assistant is streaming; they stop once the full message arrives.

## 6 ▪ Troubleshooting checklist

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| Characters not visible | CSV import skipped `is_visible` | Run `node scripts/create_working_characters.js` |
| “(Streaming is unavailable…)” shows | No OpenAI key & mock disabled | Ensure `src/data/mockResponses.json` exists (re-run `node generate_mock_responses.js`) |
| Continuous “Sorry, something went wrong” | Supabase row-level security blocking chat record insert | Check Supabase table policies for `chats` and `messages` |

---

### Enjoy chatting!

You now have a **graceful-degradation** chat system: real GPT-4 when keys are present, rich biblical mock persona otherwise. Feel free to add more characters or extend `mockResponses.json` for offline demos.
