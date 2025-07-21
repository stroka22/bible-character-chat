# CSV Import Guide (UPDATED)

This guide describes **exactly** how to format your CSV file for the  
“Bulk Upload Characters” feature so the data appears correctly on the Character page and in the **Character Insights Panel**.

---

## 1. Required vs Optional Columns

| Column                     | Required | Data Type / Accepted Values                   | Purpose & UI Location                                                                    |
|----------------------------|----------|-----------------------------------------------|------------------------------------------------------------------------------------------|
| `name`                     | ✅       | text (unique, case-insensitive)               | Card title, chat header                                                                  |
| `description`              | ✅       | short text                                    | Card subtitle; first line in character picker                                            |
| `persona_prompt`           | ✅       | long text                                     | System prompt that shapes the AI’s personality                                           |
| `testament`               | ✅       | `new` \| `old` (lower-case)                   | Used for filters / grouping                                                              |
| `is_visible`               | ✅       | `true` \| `false`                             | Controls public visibility                                                               |
| `opening_line`             | ☐        | text                                          | First greeting the character sends                                                       |
| `avatar_url`               | ☐        | https URL (square, ≤ 500 kB)                  | Profile circle in chat header & bubbles                                                  |
| `feature_image_url`        | ☐        | https URL (16:9)                              | Hero/banner image (future use)                                                           |
| `bible_book`               | ☐        | text                                          | Shown on card & insights panel                                                           |
| `timeline_period`          | ☐        | text                                          | Insights → Historical Context                                                            |
| `historical_context`       | ☐        | long text                                     | Insights → Historical Context                                                            |
| `geographic_location`      | ☐        | text                                          | Insights → Historical Context                                                            |
| `key_scripture_references` | ☐        | comma / semicolon list                        | Insights → Key Scripture References (clickable)                                          |
| `theological_significance` | ☐        | long text                                     | Insights → Theological Significance                                                      |
| `relationships`            | ☐        | JSON string *or* `{}`                         | Insights → Relationships (chips grouped by type)                                         |
| `study_questions`          | ☐        | multi-line text (`\n` per question)           | Insights → Study Questions                                                               |

**Not in DB:** `scriptural_context`, `short_biography` – omit or they’ll be ignored.

---

## 2. How These Fields Appear in the UI

### Character Card / Picker
• Avatar → `avatar_url`  
• Name → `name`  
• Subtitle → `description`

### Chat Header
• Avatar & Name → `avatar_url`, `name`  
• Greeting button uses `opening_line`

### Character Insights Panel
| Panel Section               | Consumed Fields                         |
|-----------------------------|-----------------------------------------|
| Historical Context          | `timeline_period`, `geographic_location`, `historical_context` |
| Key Scripture References    | `key_scripture_references`              |
| Theological Significance    | `theological_significance`              |
| Relationships               | `relationships` (JSON)                  |
| Study Questions             | `study_questions`                       |

---

## 3. Encoding & Formatting Rules

1. Header row **must match** column names above (case-sensitive).  
2. CSV **UTF-8** encoding.  
3. Quote any cell that contains commas, newlines, or quotes:  
   `\"I am Moses, who said, \\\"Let my people go\\\"\"`  
4. Boolean fields lower-case `true` / `false`.  
5. `relationships` must be valid JSON *inside* the cell:  
   `{ "family": ["Aaron","Miriam"], "opponents": ["Pharaoh"] }`  
6. File size ≤ 2 MB (~2 000 rows).

---

## 4. Minimal Working Example

```csv
name,description,persona_prompt,testament,is_visible
Jesus,"Central figure of Christianity","I am Jesus of Nazareth who taught love and forgiveness.",new,true
Paul,"Apostle to the Gentiles","I am Paul, formerly Saul of Tarsus.",new,true
Moses,"Prophet who led Israel out of Egypt","I am Moses who received the Law.",old,true
```

---

## 5. Comprehensive Example (all optional fields)

```csv
name,description,persona_prompt,opening_line,avatar_url,is_visible,testament,bible_book,feature_image_url,timeline_period,historical_context,geographic_location,key_scripture_references,theological_significance,relationships,study_questions
Jesus,"Son of God","I am Jesus...","Peace be with you.",https://img.example/jesus.jpg,true,new,"Matthew, Mark","https://img.example/jesus_banner.jpg","4 BCE – 30 CE","Roman occupation; Second Temple period","Galilee, Judea","John 3:16; Matt 5:3-12","Center of Christian faith","{""disciples"":[""Peter"",""John""]}","What is the Kingdom of God?\nHow should we love our enemies?"
```

---

## 6. Common Errors & Fixes

| Console Error                                        | Cause                                | Fix                                          |
|------------------------------------------------------|--------------------------------------|----------------------------------------------|
| 400 “column … does not exist”                        | Unknown header                       | Remove/rename column                         |
| `testament_check` constraint failure                 | Value not `new`/`old`                | Use exact lower-case values                  |
| Avatar not showing                                   | Broken URL / not HTTPS               | Provide valid HTTPS square image             |
| Relationships panel empty despite data               | Malformed JSON                       | Validate JSON (double quotes, braces)        |

---

## 7. Recommended Workflow

1. Start with the **Minimal Example** → confirm success.  
2. Add optional fields incrementally → test each upload.  
3. Keep a master CSV (UTF-8) under version control.  
4. After import, open a character page → verify Insights panel shows all data.  

Happy importing — your characters will now display perfectly in both the list and the Character Insights Panel! 🎉
