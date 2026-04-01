-- Species directory table for MEZCALÓMANO
create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  species_id int not null unique,
  common_name text not null,
  scientific_name text,
  size_height_feet text,
  size_height_meters text,
  habitat jsonb,
  elevation_range text,
  management_category text,
  producers text,
  image_url text,
  created_at timestamptz default now()
);

comment on column public.species.habitat is 'JSON: { "terrain": "", "climate": "", "soil": "" }';

-- Allow public read for directory (no auth required)
alter table public.species enable row level security;

create policy "Allow public read access on species"
  on public.species for select
  using (true);
