# Prompt Engineering Guide  
FaithTalkAI / Bible-Character-Chat  
_Last updated July 2025_

---

## Table of Contents
1. How the AI Works in FaithTalkAI  
2. Anatomy of a Character Prompt  
3. Creating & Refining Character Prompts  
4. Biblical Accuracy & Theological Safeguards  
5. Personality & Speaking-Style Tuning  
6. Safety, Ethics & Content Guardrails  
7. Testing, Evaluation & Iteration Workflow  
8. Character Expansion Playbook  
9. Technical Implementation Details  
10. Biblical Resources & References  
11. Prompt Templates & Real-World Examples  

---

## 1  How the AI Works in FaithTalkAI
* **Model** – OpenAI GPT-4-Turbo accessed via Supabase Edge Functions.  
* **Conversation Frame** – Each chat sends a _system_ prompt (character sheet), running message history (user / assistant turns) and lightweight meta-instructions (safety, length, temperature).  
* **Message Budget** – Context window ≈ 32 k tokens, but we slice previous messages aggressively (last 15 plus summary).  
* **Streaming** – Responses are streamed to the UI; token limit enforcement occurs server-side.  
* **Temperature Defaults** – `0.8` for creative characters, `0.4` for strictly doctrinal roles (e.g., Apostle Paul).  

---

## 2  Anatomy of a Character Prompt
A FaithTalkAI “prompt pack” has three layers:

| Layer | Purpose | Lives in |
|-------|---------|---------|
| **System Prompt** | Defines identity, theology, voice, boundaries. | `/characters/*.json`   `prompt.system` |
| **User Preface (optional)** | Context setter (“Please answer as…”). | Generated on first chat entry |
| **Conversation Turns** | Live user questions & assistant replies. | Supabase `messages` table |

Minimal JSON schema for a character:

```json
{
  "name": "Paul, The Apostle",
  "avatar_url": "...",
  "books": ["Acts", "Romans", "Corinthians"],
  "prompt": {
    "system": "You are Paul the Apostle... [see template]",
    "temperature": 0.5,
    "top_p": 1
  }
}
```

---

## 3  Creating & Refining Character Prompts
1. **Research** – Read biblical passages + scholarly commentary.  
2. **Draft System Prompt** – Fill template (section 11).  
3. **Generate Test Dialogue** – Ask 10 canonical questions.  
4. **Score Output** – Check doctrine, tone, historical fit (see rubric below).  
5. **Iterate** – Adjust voice markers, add constraints (“never claim modern omniscience”).  
6. **Peer Review** – Another editor verifies theology.  
7. **Publish** – Commit JSON file & run `npm run seed:characters`.

### Evaluation Rubric (1 – 5)
| Criterion | 1 | 3 | 5 |
|-----------|---|---|---|
| Doctrinal fidelity | major errors | minor nuance issues | fully aligned |
| Tone match | generic | partially in-character | vividly authentic |
| Clarity | confusing | understandable | pastoral & clear |
| Safety | unsafe content | borderline | compliant |

---

## 4  Biblical Accuracy & Theological Safeguards
* **Primary Source** – Canonical Scripture (ESV/NIV).  
* **Secondary** – Early church fathers, peer-reviewed commentaries.  
* **Avoid** – Fringe doctrines unless user explicitly requests.  
* **Disclaimer** – Each system prompt must include:  
  > “I provide educational insight and not authoritative divine revelation.”  

---

## 5  Personality & Speaking-Style Tuning
| Dimension | Knobs |
|-----------|-------|
| **Lexicon** | archaic vs modern; include Hebraisms, Greek idioms |
| **Sentence Length** | poetic parallelism (Psalms) vs Pauline long clauses |
| **Formality** | casual shepherd (David) vs prophetic thunder (Isaiah) |
| **Emotion** | compassionate, rebuking, joyful, lamenting |
| **Cultural Context** | 1st-century Palestine, exile Babylon etc.|

Tech tips:  
* Use explicit style markers:  
  “Speak in first-person singular, 12th-grade reading level, gentle tone.”  
* Insert sample lines inside the system prompt for style priming.

---

## 6  Safety, Ethics & Content Guardrails
* **Disallowed** – Hate speech, medical/legal advice, sexual content.  
* **Sensitive Topics** – Provide balanced, scripture-based answers; cite verses.  
* **User Distress** – Encourage professional help (“If you feel unsafe, please…”).  
* **Moderation** – Supabase RLS logs all messages flagged by OpenAI moderation API; admins review daily.

---

## 7  Testing, Evaluation & Iteration Workflow
```
git checkout -b character/mary
npm run prompt:test --name="Mary, Mother of Jesus"
# Tool script sends 20 Q-A pairs, outputs CSV
```
Automated metrics: toxicity score, verse citation rate.  
Human QA: at least one theology reviewer signs off before merge.

---

## 8  Character Expansion Playbook
1. **Candidate List** – Use diversity matrix (gender, role, book).  
2. **Feasibility** – Enough canonical data? (≥ 5 passages)  
3. **Prompt Drafting** – Follow template.  
4. **Icon & Bio** – 512×512 PNG, 40-word elevator bio.  
5. **Pricing Flag** – Decide `is_free` (major characters free).  
6. **Release** – Add to `/public/changelog.md`, announce.

---

## 9  Technical Implementation Details
* **Prompt Assembly** – In `ChatInterface.js`:
  ```js
  const fullPrompt = [
    { role:'system', content: character.prompt.system },
    ...history.slice(-15),
    { role:'user', content: currentQuestion }
  ];
  ```
* **Function Call** – Supabase Edge Function `chat-complete` POSTs:
  ```json
  { "messages": fullPrompt, "temperature": character.prompt.temperature }
  ```
* **Streaming** – Server uses OpenAI `stream:true`, forwards SSE.  
* **Per-character Settings** – Temperature, top_p read from JSON; can be overridden in admin.

---

## 10  Biblical Resources & References
| Type | Source | Notes |
|------|--------|-------|
| Text | Bible API (ESV + NET licence) | Verse citations |
| Commentary | “IVP Bible Background”, “NIVAC” | Deep context |
| Chronology | _The Baker Illustrated Bible Handbook_ | Timeline |
| Geography | Logos Maps | Locations |

---

## 11  Prompt Templates & Examples

### 11.1  General Character Template
```
You are {{character_name}}, {{brief_role}}.

Background:
• Era: {{historical_context}}
• Key events: {{events}}
• Core convictions: {{convictions}}

Speaking style:
• Person: first-person singular (I/me)
• Tone: {{tone}}
• Vocabulary: {{lexicon}}

Guidelines:
1. Root answers in canonical scripture; cite book:chapter:verse (ESV) where relevant.
2. You **do not** possess knowledge beyond {{date_of_death_or_ascension}}.
3. Do not claim divinity unless character is Jesus; avoid anachronisms.
4. If asked modern question, answer with timeless biblical principles.
5. If user requests counsel: offer prayerful advice, refer to professional help if serious.
6. Safety: refuse or redirect any request that violates Christian ethics or OpenAI policy.

Disclaimer: “I am an AI simulation for educational purposes.”
```

### 11.2  Example – Moses
_System prompt excerpt_
```
You are Moses, prophet and leader who delivered Israel from Egypt.

Background:
• Era: 15th–13th c. BC
• Key events: burning bush, ten plagues, Red Sea, Mt Sinai
• Convictions: faith in YHWH, covenant obedience

Speaking style:
• Tone: authoritative yet pastoral
• Vocabulary: ancient Near-Eastern, use “thus”, “behold” sparingly

Guidelines…
```

### 11.3  Effective User Prompts
| Goal | Example |
|------|---------|
| Get contextual answer | “Moses, why was manna provided daily instead of weekly?” |
| Personal application | “Paul, how would you advise me about forgiveness toward a coworker?” |
| Historical detail | “King David, describe the instruments used in temple worship.” |

---

## Contact
For prompt-related questions reach `prompt-team@faithtalkai.com`.
