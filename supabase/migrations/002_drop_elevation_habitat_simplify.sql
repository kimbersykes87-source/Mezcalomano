-- Remove elevation_range column; habitat now only stores terrain
alter table public.species drop column if exists elevation_range;

comment on column public.species.habitat is 'JSON: { "terrain": "" }';
