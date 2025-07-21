# CSV Import Structure Guide

This document defines **exactly** how your CSV file must be formatted for the “Bulk Upload Characters” feature in the Admin Panel.  
If any required column is missing or a value violates the constraints below, the upload will fail with a **400** error from Supabase.

---

## 1. Column Reference

| Column name                | Required | Type / Allowed values                          | Notes                                                                                           |
|----------------------------|----------|------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `name`                     | ✅       | text (unique)                                  | Primary identifier. *Must be unique* (case-insensitive) per character.                         |
| `description`              | ✅       | text                                           | Shown on the character card. 1–2 concise sentences.                                            |
| `persona_prompt`           | ✅       | long-text                                      | System prompt that shapes the AI’s behaviour.                                                   |
| `testament`               | ✅       | `new` \| `old`                                 | Lower-case only. Upload logic coerces anything else to `new`, but **avoid typos**.              |
| `is_visible`               | ✅       | `true` \| `false`                              | Whether the character is displayed to regular users.                                            |
| `opening_line`             | ☐        | text                                           | First greeting in chat. (Legacy CSVs can use `opening_sentence`, automatically mapped.)         |
| `avatar_url`               | ☐        | URL                                            | 300×300px square recommended. HTTPS only.                                                       |
| `feature_image_url`        | ☐        | URL                                            | 1000×560px hero banner. HTTPS only.                                                             |
| `bible_book`               | ☐        | text                                           | Primary book(s) in which the character appears.                                                 |
| `scriptural_context`       | ☐        | long-text                                      | Key passages & summary.                                                                         |
| `timeline_period`          | ☐        | text                                           | e.g. `1391-1271 BCE (approx.)`                                                                 |
| `historical_context`       | ☐        | long-text                                      | Cultural & political backdrop.                                                                  |
| `geographic_location`      | ☐        | text                                           | Comma-separated places.                                                                         |
| `key_scripture_references` | ☐        | text                                           | Comma *or* semicolon list (`Ex 3:14; Dt 34:10-12`).                                             |
| `theological_significance` | ☐        | long-text                                      | Why the character matters.                                                                      |
| `relationships`            | ☐        | JSON string                                    | Example: `{"family":["Aaron","Miriam"],"opponents":["Pharaoh"]}`                                |
| `study_questions`          | ☐        | multi-line text                                | One question per line.                                                                          |

> **Deprecated column**: `short_biography`  
> Earlier guides referenced this field, but **it does not exist in the current schema**.  
> If present, it is ignored (a warning is shown in the browser console).

> **Removed column**: `scriptural_context`  
> This field triggered 400-errors because it is **not** defined in the current `characters` table.  
> Only columns listed in the table above are recognised by the database.

---

## 2. Encoding & Formatting Rules

1. **Header row is mandatory** and must use the exact names above (case-sensitive).  
2. **UTF-8** encoding (`CSV UTF-8` in Excel).  
3. Quote any field that contains commas, newlines, or quotes:  
   ```csv
   "Moses","Led Israel, received the Law",...
   ```  
4. `relationships` must be valid JSON **inside** the cell (double-quoted keys/values).  
5. Boolean fields = `true` / `false` (lower-case).  
6. Maximum ~2 MB per upload (≈ 2 000 rows) – browser limit.

---

## 3. Common Errors & Fixes

| Symptom / Console message                                              | Likely cause                              | Resolution                                                  |
|------------------------------------------------------------------------|-------------------------------------------|-------------------------------------------------------------|
| `400 ()` when uploading CSV                                            | Missing required column or bad value      | Verify header row & required fields                         |
| `Could not find the 'short_biography' column`                          | Deprecated column present                 | Remove column or ignore warning (field is ignored)          |
| `violates check constraint "characters_testament_check"`               | Testament value not `new`/`old`           | Use exactly `new` or `old`                                  |
| `relationships` JSON parse warning in console                          | Malformed JSON string                     | Validate with jsonlint.com                                  |
| Avatar not showing                                                     | Image URL unreachable / not square        | Use HTTPS and 1:1 aspect ratio ≤ 500 kB                      |
| Upload spinner never ends                                              | File > 2 MB or network stalled            | Split file, retry                                           |

---

## 4. Minimal Working Example

Save the following as **`minimal_characters.csv`** and upload via Admin Panel → *Bulk Upload*:

```csv
name,description,persona_prompt,testament,is_visible
Jesus,"Central figure of Christianity","I am Jesus of Nazareth...",new,true
Paul,"Apostle to the Gentiles","I am Paul, formerly Saul...",new,true
Moses,"Prophet who led Israel out of Egypt","I am Moses who met God in a burning bush",old,true
```

This file contains only the required fields and has been verified to import successfully.

---

## 5. Tips for Large Imports

1. Start with **10 rows max** – confirm success – then scale up.  
2. Keep a master sheet; export a clean CSV (no extra header lines).  
3. Use separate CSVs for groups vs characters.  
4. After import, refresh the *Characters* table to verify records.  
5. Always keep a backup of your CSV before experimenting.

Happy importing! 🎉
