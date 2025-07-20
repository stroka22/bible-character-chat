# CSV Import Guide

This document explains how to bulk-import Bible characters and character groups into **Bible Character Chat** using the Admin panel.

---

## 1. Using the Sample CSV Files

Two ready-made CSV files live in the project root:

* **sample_characters.csv** – 5 well-formed character rows (Moses, David, Mary, Paul, Ruth).  
* **sample_groups.csv** – 10 example groups (Torah Figures, Kings and Rulers, …).

Steps to test:

1. Start the application (`./run-app.sh` or `npm run dev`).
2. Log in as an Admin (or enable `VITE_SKIP_AUTH=true`).
3. Navigate to **Admin Panel → Bulk Upload**.
4. Click **Choose File** and select the desired sample CSV.
5. Wait for the success message – rows appear immediately in the tables below.

---

## 2. Expected CSV Formats

### 2.1 Character Import

| Column                      | Required | Notes / Example                                                                                     |
|-----------------------------|----------|------------------------------------------------------------------------------------------------------|
| `character_name`            | ✅       | Display name – **must be unique**. “Moses”                                                          |
| `avatar_url`                |          | Public 1:1 image (<300 px). Can be blank – fallback avatar generated.                               |
| `feature_image_url`         |          | Optional hero banner (16:9).                                                                        |
| `short_biography`           | ✅       | 1-2 sentence bio. No markdown.                                                                      |
| `bible_book`                |          | Primary book(s) – “Exodus”, “Luke”                                                                  |
| `opening_sentence`          |          | First greeting used in chat.                                                                        |
| `persona_prompt`            | ✅       | System prompt that shapes AI personality. <5000 chars.                                              |
| `scriptural_context`        |          | Key passages summarised.                                                                            |
| `description`               | ✅       | Shown on selection card.                                                                            |
| `is_visible`                | ✅       | `true` / `false` (case-insensitive).                                                                |
| **Insights Extended Fields**|          |                                                                                                      |
| `timeline_period`           |          | “1391-1271 BCE (approximate)”                                                                       |
| `historical_context`        |          | Paragraph; will show under *Historical Context*.                                                    |
| `geographic_location`       |          | Comma-separated places.                                                                             |
| `key_scripture_references`  |          | Semicolon **or** comma separated list – “Ex 3:14; Dt 34:10-12”.                                     |
| `theological_significance`  |          | Why the character matters.                                                                          |
| `relationships`             |          | JSON string mapping relationship types → arrays (see sample).                                       |
| `study_questions`           |          | One question per line (`\n`).                                                                       |

Missing *non-required* fields are stored as `null` and hidden in the UI.

### 2.2 Group Import

| Column            | Required | Notes / Example                          |
|-------------------|----------|------------------------------------------|
| `group_name`      | ✅       | Unique – “Prophets”                      |
| `description`     | ✅       | Short summary (1-2 sentences)            |
| `time_period`     |          | “850-400 BCE”; appears in future filters |
| `is_visible`      | ✅       | `true` / `false`                         |

---

## 3. Admin-Panel Import Workflow

1. **Open Admin Panel**  
   Header ➜ **Admin Panel** (appears if you’re admin or `VITE_SKIP_AUTH=true`).

2. **Select Bulk Upload Section**  
   It’s the first card under *Bulk Upload Characters (CSV)*.

3. **Choose Your File**  
   * Only `.csv` files are accepted.  
   * Maximum ~2 MB (≈ 2 000 rows) – browser limit.

4. **Upload & Processing**  
   *Progress bar and toast messages appear.*  
   • Valid rows → inserted/updated.  
   • Invalid rows → skipped and listed in the error report.

5. **Verify**  
   New characters/groups immediately show in the lower tables and the public **Character Selection** page.

---

## 4. Creating Your Own CSVs

1. **Start from the samples** – copy, delete rows, and fill in your data.  
2. **Use UTF-8 encoding** – Excel → *Save As → CSV (UTF-8)*.  
3. **Keep the header row exactly** as listed above (order doesn’t matter, names do).  
4. **Boolean & JSON fields**  
   * `is_visible` must be `true` or `false`.  
   * `relationships` JSON must be *quoted* and valid, e.g.:  
     ```
     {"family":["Aaron","Miriam"],"opponents":["Pharaoh"]}
     ```
5. **Line breaks** – wrap long text in quotes (`"`) if it contains commas or newlines.  
6. **Test in small batches** (3-5 rows) before a full upload.

---

## 5. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| “Invalid header” error | Column names don’t match exactly | Copy header row from this guide |
| Rows skipped silently | Required field blank or duplicate `character_name` | Check values; names must be unique |
| JSON parse failure on `relationships` | Malformed JSON (missing quotes, brackets) | Validate with JSONLint |
| Image not showing | URL unreachable or not square | Use https images ≤500 kB |
| Upload spinner never ends | File >2 MB or network issue | Split file into parts, retry |
| Group link missing in UI | `is_visible=false` | Set to `true` or toggle in database |

---

Happy importing! If you hit issues not covered here, open an issue in GitHub or ping the tech lead on Slack.  
