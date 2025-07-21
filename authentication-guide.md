# Authentication & Authorization Guide

Welcome to the **Bible Character Chat** authentication manual.  
This document explains **how the new Supabase-backed role system works, how to deploy it, and how to verify everything is locked down**.

---

## 1. System Overview

The app now uses **email / password auth via Supabase** plus a lightweight **`profiles` table** that stores:

| column | type | notes |
|--------|------|-------|
| `id`   | `uuid` | **PK**, matches `auth.users.id` |
| `email`| `text`| duplicated for convenience & indexing |
| `display_name` | `text` | optional public name |
| `avatar_url` | `text` | optional profile picture |
| `role` | `user_role` ENUM | `'user'`, `'pastor'`, `'admin'` |
| `created_at`, `updated_at` | `timestamptz` | autopopulated triggers |

Key points:

* **Row Level Security** (RLS) is ON.  
  Access is granted through policies not by default.
* A Postgres trigger **creates a profile row automatically** whenever someone signs-up.
* React `AuthContext` fetches the profile once after login and exposes helpers:
  * `role` – current role string
  * `isPastor()`  – `true` for *pastor* **or** *admin*
  * `isAdmin()`   – `true` only for *admin*

Routes are gated with a reusable `<ProtectedRoute>` component.

---

## 2. Roles & Permissions

| Ability | user | pastor | admin |
|---------|------|--------|-------|
| View public characters / chat | ✅ | ✅ | ✅ |
| View **hidden** characters | ❌ | ✅ | ✅ |
| Create / edit characters | ❌ | ✅ | ✅ |
| Bulk CSV import | ❌ | ✅ | ✅ |
| Manage character groups | ❌ | ✅ | ✅ |
| View list of users | ❌ | ❌ | ✅ |
| Promote / demote users | ❌ | ❌ | ✅ |
| Modify RLS / database | ❌ | ❌ | ✅ (via dashboard / SQL) |

> Pastors are effectively **content editors**.  
> Admins can do everything, including user management and infrastructure tweaks.

---

## 3. Setting-up the Migration

1. **Open Supabase SQL editor** (or `psql`/`supabase db remote`).
2. Run the file `supabase/migrations/20250708_auth_profiles.sql` (already in repo).

What the script does:

* Creates an **ENUM** `user_role`.
* Creates `profiles` table & indexes.
* Enables RLS and adds select/update policies for:
  * Self-service access
  * Pastors (limited)
  * Admins (full)
* Adds `handle_new_user()` trigger on `auth.users` so every signup gets a profile.
* Adds `handle_updated_at()` trigger to keep `updated_at` fresh.

_No further manual table tweaking is needed._

### Local CLI

```bash
supabase db reset            # optional fresh start
supabase db push             # executes pending migrations
```

Make sure your `.env.local` (or `.env`) contains:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 4. Testing the Flow

### 4.1 Signup & basic login

1. Start the dev server `npm run dev`.
2. Browse to `http://localhost:5173/signup`.
3. Register with a non-privileged email — you will be assigned the **user** role.
4. Login → you should reach the normal chat UI.
5. Manually hit `/admin` → **Access Denied** page appears (correct).

### 4.2 Promote to pastor

1. In the Supabase dashboard run:

```sql
update profiles set role = 'pastor' where email = 'YOUR_EMAIL';
```

2. Refresh `/admin` → You can now access **Characters** and **Groups** tabs.
3. **User Management** tab is still hidden (only admins).

### 4.3 Test admin privileges

*Either* promote your account to admin:

```sql
update profiles set role = 'admin' where email = 'YOUR_EMAIL';
```

*Or* create a separate admin user (see section 5).

Verify:

* `/admin` shows **User Management** tab.
* You can promote / demote other profiles between `user` and `pastor`.
* RLS test: From the SQL editor try  
  `select * from profiles;` while authenticated as *pastor* — you will only see *user* rows plus yourself.

---

## 5. Creating the First Admin

Supabase will not automatically grant **admin** to anybody for security.  
There are two common approaches:

### 5.1 Via Dashboard (easiest)

1. Go to **Authentication → Users**.
2. Add a new user or select an existing one.
3. Copy the user’s UUID.
4. Go to **Database → Table Editor → profiles**.
5. Find the row (same UUID) and change the **role** column to `admin`.

### 5.2 Via SQL

Paste and adjust the email:

```sql
-- promote an existing user
update profiles
set role = 'admin'
where email = 'founder@example.com';
```

If you need to seed a fresh admin account from scratch:

```sql
-- 1) create auth user
insert into auth.users (id, email, encrypted_password)
values (gen_random_uuid(), 'founder@example.com', crypt('VerySecurePassword', gen_salt('bf')));

-- 2) insert profile row manually
insert into public.profiles (id, email, display_name, role)
select id, email, 'Founder', 'admin'
from auth.users
where email = 'founder@example.com';
```

(Using the dashboard UI is strongly recommended.)

---

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Signup succeeds but profile role is **null** | Trigger missing | Re-run migration or ensure `public.handle_new_user` trigger exists |
| All queries return `0 rows` for non-admin | RLS disabled / wrong policies | Double-check policies; `alter table profiles enable row level security;` |
| React app shows endless spinner | `.env` env vars not set or Supabase keys invalid | Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |

---

## 7. Next Steps

* Wire-up payment ↔ role upgrades (premium tiers).
* Add email verification guard before allowing chat usage.
* Provide in-app UI for admins to promote/demote instead of SQL only (basic table already scaffolded).

Happy building ✨
