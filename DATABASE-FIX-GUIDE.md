# Database Fix Guide  
_Bible Character Chat_

---

## 1  Overview of Current Issues  

| Area | Problem | Effect in App |
|------|---------|---------------|
| **Profiles table (RLS)** | Legacy Row-Level-Security policies were recursive / missing. Admin row may not exist. | UI cannot recognise `admin` / `pastor` roles; some profile queries fail. |
| **Characters table (column names)** | Database uses `name`, `description`, `opening_line` but frontend expects `character_name`, `short_biography`, `opening_sentence`. | Main React app throws errors & shows blank screen; emergency html needed as fallback. |

Fixing these two areas restores normal login/role detection **and** allows the main React bundle to render characters correctly.

---

## 2  Profiles RLS Fix — Step-by-Step  

1. **Open Supabase → SQL Editor**  
2. **Copy / paste and run** the block below _exactly once_:  

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES 
  ('f70a4893-ee61-4079-a760-f1871e6ae590','stroka22@yahoo.com','admin',NOW(),NOW())
ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = NOW();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename='profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY profiles_select  ON public.profiles FOR SELECT  USING (true);
CREATE POLICY profiles_insert  ON public.profiles FOR INSERT  WITH CHECK (true);
CREATE POLICY profiles_update  ON public.profiles FOR UPDATE  USING (true);
CREATE POLICY profiles_delete  ON public.profiles FOR DELETE  USING (true);
```

3. **Why this works**  
   • Disables RLS → lets you update rows safely.  
   • Ensures the known admin UUID exists & has role `admin`.  
   • Drops all stray policies → prevents recursion.  
   • Re-enables RLS with simple, open policies (tighten later).  

4. **Refresh**  
   - Restart your dev server `npm run dev`.  
   - Clear browser cache or use hard-reload.  
   - From `/session-debug.html` press **“Refresh Session”**. _Role should now read `admin`._

---

## 3  Fixing the Character Column Mismatch  

Choose **ONE** of the following approaches.

### Option A – Quick Database View (≅3 min)

1. Run this SQL (or use _public/create-database-view.html_ helper):

```sql
CREATE OR REPLACE VIEW public.characters_expected AS
SELECT  id,
        name          AS character_name,
        description   AS short_biography,
        opening_line  AS opening_sentence,
        *             -- passes through all remaining columns
FROM    public.characters;
```

2. In Supabase **Table Editor** make sure RLS matches that of `characters` (or disable while testing).  
3. Update frontend fetches to call the view:  

```js
supabase.from('characters_expected') ...
```

No code refactor needed; undo later when you rename columns.

---

### Option B – Frontend Refactor (preferred long-term)

1. Search under `src/` for these obsolete fields:  

```
character_name, short_biography, opening_sentence
```

2. Replace them with:  

| Old prop                | New prop       |
|-------------------------|----------------|
| `character_name`        | `name`         |
| `short_biography`       | `description`  |
| `opening_sentence`      | `opening_line` |

3. Key files (see handoff §11):  

- `src/pages/CharacterGrid.jsx / CharacterSelection.tsx`  
- `src/pages/ChatPage.jsx / ChatInterface.tsx`  
- `src/hooks/useCharacters.ts` (if present)  
- Any test utilities or storybook files.

4. Re-run `npm run dev` – console should be clean.

---

## 4  Testing After Fixes  

1. **Profiles / Role**  
   - Visit `/session-debug.html` → _Check Auth_ → _Check Profile_.  
   - Role must display `admin`.  

2. **Emergency App**  
   - Browse to `/emergency-app.html` → characters should list without error.  

3. **Main React App**  
   - Open `/`  
   - Character thumbnails render; selecting one opens chat with opening line.  
   - Dev-tools console shows **no red errors**.

4. **Edge cases**  
   - Sign out / sign in – admin dashboard should unlock automatically.  
   - Non-admin login should hide admin routes.

---

## 5  Troubleshooting  

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| `ERR_FAILED (401)` on profile fetch | RLS policies not yet replaced | Re-run SQL; call `supabase.auth.refreshSession()` in UI or clear cookies |
| Character list empty | Column mismatch not fixed everywhere | Re-search code or call the view |
| View returns 0 rows | View created but `characters` table empty for user due to RLS | Temporarily disable RLS on view/table to confirm |
| Admin still “not admin” | Browser using cached session | Hard-reload, or run `refreshSession()` in AuthContext |
| SQL “function exec_sql() does not exist” | Supabase helper function not installed | Paste SQL directly in SQL editor, or create helper (docs) |

---

## 6  Next Steps  

1. Tighten `profiles` RLS (e.g., owner-based) once admins confirmed.  
2. Decide whether to _rename columns_ or keep the compatibility view.  
3. Merge **`public/emergency-app.html`** to `/emergency` route for safe-mode access.  
4. Update README & onboarding docs.

_You are now ready to continue feature work on Bible Character Chat._  
