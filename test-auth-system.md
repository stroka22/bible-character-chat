# Auth System QA Checklist

This document walks you **end-to-end** through testing the new Supabase-backed authentication and role-based access control layer.

---

## 1. Prerequisites

| Item | Notes |
|------|-------|
| Supabase project | You must be an **owner** or **DB-admin** so you can run SQL. |
| Local `.env` | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set. |
| Dev server | `npm run dev` – Vite will print the port (e.g. `5175`). |

---

## 2. Apply / Re-apply the SQL Migration

If you saw *“relation «profiles» does not exist”* the migration never ran.

1. Open Supabase **Dashboard → SQL Editor**  
2. Copy everything in **`supabase/migrations/profiles_table.sql`** (or use the block below) and paste it in a new query tab.  
3. Hit **Run**.

```sql
-- === BEGIN QUICK-FIX MIGRATION ===
create type if not exists user_role as enum ('admin','pastor','user');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists profiles_email_idx on profiles(email);

alter table profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id,email,display_name,role)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'name',new.email),'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
before update on profiles for each row execute function public.handle_updated_at();
-- === END QUICK-FIX MIGRATION ===
```

**Verify**

```sql
select * from profiles limit 5;
```

You should get **0–5 rows** (depending on existing users) instead of an error.

---

## 3. Happy-Path Flow

1. Browse to `/signup` (e.g. `http://localhost:5175/signup`).  
2. Register with **test-user@example.com** / any password (≥ 8 chars).  
3. After redirect, log in at `/login`.  
4. You land on the Chat home page.  
5. Attempt `http://localhost:5175/admin` → should redirect to **Access Denied**.

---

## 4. Profile Row Check

In SQL editor:

```sql
select id,email,role from profiles where email = 'test-user@example.com';
```

Role should be **`user`**.

---

## 5. Promote to Pastor and Re-test

```sql
update profiles set role = 'pastor'
where email = 'test-user@example.com';
```

Reload `/admin`:

* Characters & Groups tabs should be visible.  
* **User Management** tab should **NOT** appear.

---

## 6. Promote to Admin

```sql
update profiles set role = 'admin'
where email = 'test-user@example.com';
```

Reload `/admin` again:

* All three tabs (Characters, Groups, **User Management**) visible.  
* You can promote / demote other users.

---

## 7. Route-Access Matrix

| Route | user | pastor | admin |
|-------|------|--------|-------|
| `/login` `/signup` | ✅ | ✅ | ✅ |
| `/` (chat) | ✅ | ✅ | ✅ |
| `/admin` | ❌ | ✅ | ✅ |
| `/admin/users` | ❌ | ❌ | ✅ |

---

## 8. Error Scenarios to Trigger

| Test | Expected Result |
|------|-----------------|
| Wrong password on `/login` | Red banner with error message |
| Re-sign-up with same e-mail | “User already registered” error |
| Visit `/admin` while **signed-out** | Redirect to `/login` |
| Visit `/access-denied` manually | Static denied page (always works) |
| SQL: `select * from profiles` when logged in as **pastor** via SQL Editor → connect token | Only rows with `role='user'` plus your own profile |

---

## 9. Troubleshooting FAQ

| Symptom | Fix |
|---------|-----|
| `relation "profiles" does not exist` | Run migration in § 2 |
| Endless spinner after login | Check `.env` keys & network console for 401 errors |
| Pastors see **User Management** tab | Their profile was set to `admin`, not `pastor` – verify with SQL |
| Updates to `display_name` ignored | Ensure `updateProfile()` sends the field and RLS allows it |

---

## 10. Cleanup / Reset

```bash
# Local: wipe sessions & vite cache
rm -rf .vite && rm -rf node_modules/.vite

# Supabase: optional – remove test account
delete from auth.users where email = 'test-user@example.com';
```

*You’re ready to ship!*
