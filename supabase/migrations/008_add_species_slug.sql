-- Stable URL slug for directory detail queries (mirrors app slug from common_name; see src/lib/slug.ts)
alter table public.species
  add column if not exists slug text;

create unique index if not exists species_slug_key on public.species (slug);
