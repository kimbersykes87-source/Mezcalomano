-- Six directory fields added with the Nov 2026 species page update.
-- Filled by scripts/seed-species-from-csv.mjs from data/Species_Final - Website.csv.
alter table public.species
  add column if not exists taste_highlight text,
  add column if not exists nickname text,
  add column if not exists size_category text,
  add column if not exists management_category text,
  add column if not exists elevation_range text,
  add column if not exists conservation_status text;
