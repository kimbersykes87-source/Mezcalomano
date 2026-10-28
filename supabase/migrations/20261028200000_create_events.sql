-- Website click events for the admin dashboard (admin.mezcalomano.com).
-- Written server-side by /api/track with the service role only.
-- No IP addresses or cookies are stored.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null,
  path text,
  target_url text,
  target_host text,
  species_slug text,
  link_group text,
  referrer_host text,
  country text,
  device text
);

create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_type_created_idx on public.events (type, created_at);

alter table public.events enable row level security;

-- No policies: anon/authenticated cannot read or write.
