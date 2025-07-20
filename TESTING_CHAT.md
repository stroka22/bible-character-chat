# Testing Chat Functionality  
_Bible Character Chat – Quick QA Guide_

## 1 ▪ Launch the App
1. Build & serve (from project root):  
   ```bash
   ./run-app.sh        # or: npm run build && npm run preview -- --port 5186
   ```  
2. Open **http://localhost:5186** – the Home page shows three demo cards:  
   • Jesus (Final) • Paul (Final) • Moses (Final)

## 2 ▪ Start a Conversation
1. Click a character card → chat view opens with an opening line.  
2. Observe the **typing indicator** (animated dots) whenever the assistant is generating a reply.

## 3 ▪ Test Message Types
| Scenario | What to Send | What to Expect |
|----------|--------------|----------------|
| Greeting | `Hi there!` | Character-style greeting |
| Theology | `What is faith?` | Concise biblical answer |
| Suffering | `Why do good people suffer?` | Pastoral response |
| Personal history | `Tell me about your life` | Narrative in first person |
| Multi-turn | Continue with follow-ups | Context is preserved |
| Error handling | Turn off Wi-Fi mid-stream | “Retry” banner appears → click **Retry** to resend |

## 4 ▪ OpenAI vs Mock Mode
| Mode | How to Enable | Behaviour |
|------|---------------|-----------|
| **Live GPT-4** | Ensure `VITE_OPENAI_API_KEY` in `.env` is a valid key | Real-time streamed responses |
| **Mock Fallback** | Comment out / remove the key **or** disconnect internet | Rich canned replies generated from `src/data/mockResponses.json` (still streamed for realism) |

The app auto-detects failures: if OpenAI returns an error _or_ no key is present, it seamlessly switches to mock mode—no user action required.

### Verify the Switch
1. Remove the key and restart the server.  
2. Send a message; browser console logs:  
   `[OpenAI] No API key detected… using mock responses`.  
3. Restore the key, restart; messages now come from GPT-4.

## 5 ▪ Troubleshooting
• **Characters not visible** – run `node scripts/create_working_characters.js`.  
• **Continuous error banner** – check browser console for CORS or Supabase policy issues.  
• **No mock replies** – confirm `src/data/mockResponses.json` exists and is bundled.

---

Happy testing!  
If all scenarios pass, chat is production-ready.
