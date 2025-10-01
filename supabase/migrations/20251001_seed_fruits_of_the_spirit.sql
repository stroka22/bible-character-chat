-- Seed: Fruits of the Spirit (public) for owner `faithtalkai`
-- Safe-idempotent: inserts only if not already present for this owner

insert into bible_studies (owner_slug, title, description, subject, visibility, is_premium)
select 'faithtalkai',
       'Fruits of the Spirit',
       'Explore the nine “fruit of the Spirit” in Galatians 5:22–23 with reflection and application.',
       'Galatians 5:22–23',
       'public',
       false
where not exists (
  select 1 from bible_studies
  where owner_slug = 'faithtalkai'
    and lower(title) in ('fruits of the spirit','fruit of the spirit')
);
