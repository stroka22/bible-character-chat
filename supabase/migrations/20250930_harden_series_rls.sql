-- Harden RLS for bible study series tables
-- Date: 2025-09-30

-- Ensure RLS is enabled
alter table public.bible_study_series enable row level security;
alter table public.bible_study_series_items enable row level security;
alter table public.user_series_progress enable row level security;

-- Drop dev-permissive policies if present
drop policy if exists bible_study_series_select_all on public.bible_study_series;
drop policy if exists bible_study_series_write_authenticated on public.bible_study_series;

drop policy if exists bible_study_series_items_select_all on public.bible_study_series_items;
drop policy if exists bible_study_series_items_write_authenticated on public.bible_study_series_items;

-- Series SELECT policies
create policy series_select_public
on public.bible_study_series
for select
using (visibility in ('public','unlisted'));

create policy series_select_admin_org
on public.bible_study_series
for select
to authenticated
using (
  public.current_user_role() = 'admin'
  and owner_slug is not distinct from public.current_user_owner_slug()
);

create policy series_select_superadmin
on public.bible_study_series
for select
to authenticated
using (public.current_user_role() = 'superadmin');

-- Series write policies (insert/update/delete) for admins in org and superadmin
create policy series_insert_admin_org
on public.bible_study_series
for insert
to authenticated
with check (
  (public.current_user_role() = 'admin' and owner_slug is not distinct from public.current_user_owner_slug())
  or public.current_user_role() = 'superadmin'
);

create policy series_update_admin_org
on public.bible_study_series
for update
to authenticated
using (
  (public.current_user_role() = 'admin' and owner_slug is not distinct from public.current_user_owner_slug())
  or public.current_user_role() = 'superadmin'
)
with check (
  (public.current_user_role() = 'admin' and owner_slug is not distinct from public.current_user_owner_slug())
  or public.current_user_role() = 'superadmin'
);

create policy series_delete_admin_org
on public.bible_study_series
for delete
to authenticated
using (
  (public.current_user_role() = 'admin' and owner_slug is not distinct from public.current_user_owner_slug())
  or public.current_user_role() = 'superadmin'
);

-- Series items SELECT policies (respect parent series visibility/ownership)
create policy series_items_select_public
on public.bible_study_series_items
for select
using (
  exists (
    select 1 from public.bible_study_series s
    where s.id = series_id
      and s.visibility in ('public','unlisted')
  )
);

create policy series_items_select_admin_org
on public.bible_study_series_items
for select
to authenticated
using (
  exists (
    select 1 from public.bible_study_series s
    where s.id = series_id
      and s.owner_slug is not distinct from public.current_user_owner_slug()
      and public.current_user_role() = 'admin'
  )
);

create policy series_items_select_superadmin
on public.bible_study_series_items
for select
to authenticated
using (
  public.current_user_role() = 'superadmin'
);

-- Series items write policies (admins within org or superadmin)
create policy series_items_insert_admin_org
on public.bible_study_series_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.bible_study_series s
    where s.id = series_id
      and (
        (public.current_user_role() = 'admin' and s.owner_slug is not distinct from public.current_user_owner_slug())
        or public.current_user_role() = 'superadmin'
      )
  )
);

create policy series_items_update_admin_org
on public.bible_study_series_items
for update
to authenticated
using (
  exists (
    select 1 from public.bible_study_series s
    where s.id = series_id
      and (
        (public.current_user_role() = 'admin' and s.owner_slug is not distinct from public.current_user_owner_slug())
        or public.current_user_role() = 'superadmin'
      )
  )
)
with check (
  exists (
    select 1 from public.bible_study_series s
    where s.id = series_id
      and (
        (public.current_user_role() = 'admin' and s.owner_slug is not distinct from public.current_user_owner_slug())
        or public.current_user_role() = 'superadmin'
      )
  )
);

create policy series_items_delete_admin_org
on public.bible_study_series_items
for delete
to authenticated
using (
  exists (
    select 1 from public.bible_study_series s
    where s.id = series_id
      and (
        (public.current_user_role() = 'admin' and s.owner_slug is not distinct from public.current_user_owner_slug())
        or public.current_user_role() = 'superadmin'
      )
  )
);

-- user_series_progress already scoped to self via policy created in initial migration
-- Optionally allow superadmin read for support/debugging (commented out by default)
-- create policy user_series_progress_superadmin_read on public.user_series_progress
--   for select to authenticated using (public.current_user_role() = 'superadmin');
