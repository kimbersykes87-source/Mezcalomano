-- Add producer_links column for comma-separated URLs (one per producer, same order as producers).
alter table public.species
  add column if not exists producer_links text;
