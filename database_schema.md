# Bible Character Chat – Database Schema

_Last updated: 2025-07-08_

## 1. `characters` Table

| Column | Type | Constraints | Purpose / Notes |
|--------|------|-------------|-----------------|
| `id` | `uuid` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique identifier |
| `name` | `text` | `NOT NULL UNIQUE` | Display name shown in selector & chat |
| `description` | `text` |  | One-sentence bio for card & list view |
| `short_biography` | `text` |  | Paragraph‐length biography (optional) |
| `persona_prompt` | `text` | `NOT NULL` | System prompt used when chatting |
| `opening_line` | `text` |  | First message shown to user in new chat |
| `avatar_url` | `text` |  | Small square (≈100 px) avatar |
| `feature_image_url` | `text` |  | Large portrait displayed inside Insights panel |
| `testament` | `text` | `CHECK (testament IN ('old','new')) DEFAULT 'old'` | For OT/NT filtering |
| `bible_book` | `text` |  | Primary book associated with character (e.g. “Genesis”) |
| `group` | `text` |  | High-level category (Prophets, Kings, Women …) |
| `scriptural_context` | `text` |  | Brief sentence on where character appears in Scripture |
| `is_visible` | `boolean` | `DEFAULT true` | Toggle to hide from regular users |
| `timeline_period` | `text` |  | Era label (e.g. “Early Church”) |
| `historical_context` | `text` |  | Socio-political setting paragraph |
| `geographic_location` | `text` |  | Main region / city |
| `key_scripture_references` | `text` |  | Semi-colon list, rendered as links |
| `theological_significance` | `text` |  | Why this character matters doctrinally |
| `relationships` | `jsonb` | `DEFAULT '{}'::jsonb` | See JSON structure below |
| `study_questions` | `text` |  | Line-break separated questions |
| `created_at` | `timestamp with time zone` | `DEFAULT now()` |  |
| `updated_at` | `timestamp with time zone` | `DEFAULT now()` |  |

### Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_characters_testament ON characters(testament);
CREATE INDEX IF NOT EXISTS idx_characters_bible_book ON characters(bible_book);
CREATE INDEX IF NOT EXISTS idx_characters_group ON characters(group);
```

---

## 2. Sample Migration SQL

If your existing table is missing any of the new columns, run the following (_edit as needed_):

```sql
-- add columns that do not yet exist
ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS feature_image_url text,
    ADD COLUMN IF NOT EXISTS testament text CHECK (testament IN ('old','new')) DEFAULT 'old',
    ADD COLUMN IF NOT EXISTS bible_book text,
    ADD COLUMN IF NOT EXISTS "group" text,
    ADD COLUMN IF NOT EXISTS timeline_period text,
    ADD COLUMN IF NOT EXISTS historical_context text,
    ADD COLUMN IF NOT EXISTS geographic_location text,
    ADD COLUMN IF NOT EXISTS key_scripture_references text,
    ADD COLUMN IF NOT EXISTS theological_significance text,
    ADD COLUMN IF NOT EXISTS relationships jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS study_questions text;

-- visibility toggle (if missing)
ALTER TABLE characters
    ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- timestamp triggers (optional)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_characters_updated
BEFORE UPDATE ON characters
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
```

---

## 3. `relationships` JSON Structure

`relationships` is stored as **JSONB** to allow flexible grouping.

Example:
```json
{
  "family": ["Mary", "Joseph"],
  "disciples": ["Peter", "John", "James"],
  "followers": ["Mary Magdalene", "Martha", "Lazarus"]
}
```

Rules:

1. **Top-level keys** are arbitrary group labels (snake_case or spaces OK).
2. **Values** must be JSON arrays of strings (character names).
3. Empty object `{}` is allowed when no data present.
4. In the UI each key is capitalised and each member rendered as a pill chip.

---

## 4. Sample CSV Template

Save as UTF-8 CSV (comma-separated, first row headers):

```
name,description,short_biography,persona_prompt,opening_line,avatar_url,feature_image_url,testament,bible_book,group,scriptural_context,is_visible,timeline_period,historical_context,geographic_location,key_scripture_references,theological_significance,relationships,study_questions
Jesus,The central figure of Christianity,Son of God and Messiah,You are Jesus of Nazareth speaking with wisdom and compassion.,Peace be with you.,https://example.com/avatar/jesus.jpg,https://example.com/feature/jesus.jpg,new,Gospels,Apostles,Appears primarily in the four Gospels,TRUE,New Testament Era,Lived under Roman rule in first-century Judea,Bethlehem & Nazareth,John 3:16; Matthew 28:19-20,Embodiment of God's salvation,"{""disciples"":[""Peter"",""John"",""James""],""family"":[""Mary"",""Joseph""]}",How can we love our neighbor?\nWhat does it mean to seek first the Kingdom?
```

Notes:

- Boolean `is_visible` must be `TRUE` or `FALSE`.
- `relationships` field must be **escaped JSON** (double quotes doubled as in example).
- Line breaks inside `study_questions` use `\n`.

---

## 5. Next Steps

1. Run the migration SQL in Supabase or via `supabase db push`.
2. Update `.env` and deployment pipelines to include any new references.
3. Use the CSV template in the **Admin Import Tool** (`admin-direct.html`) or the pastor dashboard to bulk-load characters.
4. Verify the Character Selection UI and Insights Panel now render all new fields.

This schema provides full support for:

- Advanced filtering (testament, book, group, search, A-Z)
- Insights Panel (historical context, scripture links, relationships, study questions)
- Admin visibility control & bulk import
