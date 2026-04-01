-- Add mezcal_use column for display on species cards
alter table public.species add column if not exists mezcal_use text;
