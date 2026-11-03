-- Venues map layer, Phase 0 foundations (plan v2, section 9). Additive only.
-- RLS is on for every table and there are no public policies: only the
-- service role (which bypasses RLS) reads or writes. Public reads happen
-- through the exported venues.geojson file, never through these tables.

create extension if not exists postgis with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_normalized text not null,
  address text,
  city text,
  country_code text check (country_code is null or char_length(country_code) = 2),
  lat double precision,
  lng double precision,
  geom extensions.geography(Point, 4326),
  geohash7 text,
  website text,
  website_domain text,
  status text not null default 'candidate'
    check (status in ('candidate', 'in_review', 'published', 'hidden', 'closed')),
  owner_confirmed_at timestamptz,
  pin_verified_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_checked_at timestamptz,
  closed_signals jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists venues_status_idx on public.venues (status);
create index if not exists venues_geom_idx on public.venues using gist (geom);
create index if not exists venues_geohash7_idx on public.venues (geohash7);
create index if not exists venues_name_trgm_idx on public.venues using gin (name_normalized extensions.gin_trgm_ops);

create table if not exists public.venue_sources (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues (id) on delete cascade,
  source text not null check (source in ('seed', 'overture', 'osm', 'submission', 'manual')),
  source_id text not null,
  raw jsonb,
  licence text,
  release_id text,
  fetched_at timestamptz not null default now(),
  unique (source, source_id)
);
create index if not exists venue_sources_venue_idx on public.venue_sources (venue_id);

create table if not exists public.venue_menu_snapshots (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  url text not null,
  format text not null check (format in ('html', 'pdf', 'ocr', 'owner_file')),
  fetched_at timestamptz not null default now(),
  content_hash text,
  status text not null
    check (status in ('ok', 'blocked', 'image_only', 'no_menu_found', 'parse_error')),
  mezcal_lines jsonb not null default '[]'::jsonb,
  low_confidence boolean not null default false
);
create index if not exists venue_menu_snapshots_venue_idx on public.venue_menu_snapshots (venue_id, fetched_at desc);

create table if not exists public.venue_claims (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  snapshot_id uuid references public.venue_menu_snapshots (id) on delete set null,
  kind text not null check (kind in ('species_listed', 'owner_confirmed', 'community', 'inferred')),
  species_slug text,
  species_group text,
  line_text text check (line_text is null or char_length(line_text) <= 300),
  heading text,
  confidence text not null default 'normal' check (confidence in ('strong', 'normal', 'weak', 'low_ocr')),
  state text not null default 'proposed' check (state in ('proposed', 'approved', 'rejected', 'expired')),
  reviewed_by text,
  reviewed_at timestamptz,
  expires_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now()
);
create index if not exists venue_claims_venue_state_idx on public.venue_claims (venue_id, state);
create index if not exists venue_claims_snapshot_idx on public.venue_claims (snapshot_id);

create table if not exists public.venue_reports (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  kind text not null check (kind in ('closed', 'wrong_menu', 'wrong_location', 'other')),
  message text check (message is null or char_length(message) <= 2000),
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  handled_by text
);
create index if not exists venue_reports_venue_idx on public.venue_reports (venue_id);

create table if not exists public.venue_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  website text,
  email text not null,
  message text,
  lat double precision,
  lng double precision,
  geocode_note text,
  created_at timestamptz not null default now(),
  venue_id uuid references public.venues (id) on delete set null,
  verification_state text not null default 'unverified'
    check (verification_state in ('unverified', 'awaiting_reply', 'confirmed')),
  consent_at timestamptz not null,
  ip_hash text
);
create index if not exists venue_submissions_created_idx on public.venue_submissions (created_at desc);
create index if not exists venue_submissions_iphash_idx on public.venue_submissions (ip_hash, created_at desc);
create index if not exists venue_submissions_venue_idx on public.venue_submissions (venue_id);

create table if not exists public.merge_review (
  id uuid primary key default gen_random_uuid(),
  venue_a uuid not null references public.venues (id) on delete cascade,
  venue_b uuid not null references public.venues (id) on delete cascade,
  similarity real,
  distance_m real,
  reason text,
  state text not null default 'open' check (state in ('open', 'merged', 'kept_separate')),
  created_at timestamptz not null default now(),
  decided_by text,
  decided_at timestamptz,
  check (venue_a <> venue_b)
);
create index if not exists merge_review_a_idx on public.merge_review (venue_a);
create index if not exists merge_review_b_idx on public.merge_review (venue_b);

create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('discover', 'resolve', 'geocode_check', 'fetch_menu', 'extract', 'export')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean,
  counts jsonb not null default '{}'::jsonb,
  failure_reasons jsonb not null default '{}'::jsonb,
  notes text,
  release_id text
);
create index if not exists pipeline_runs_stage_idx on public.pipeline_runs (stage, started_at desc);

create table if not exists public.unknown_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  term_normalized text not null,
  venue_id uuid references public.venues (id) on delete set null,
  context_line text check (context_line is null or char_length(context_line) <= 300),
  seen_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  state text not null default 'new' check (state in ('new', 'added_to_aliases', 'ignored'))
);
create index if not exists unknown_terms_term_idx on public.unknown_terms (term_normalized);
create index if not exists unknown_terms_venue_idx on public.unknown_terms (venue_id);

alter table public.venues enable row level security;
alter table public.venue_sources enable row level security;
alter table public.venue_menu_snapshots enable row level security;
alter table public.venue_claims enable row level security;
alter table public.venue_reports enable row level security;
alter table public.venue_submissions enable row level security;
alter table public.merge_review enable row level security;
alter table public.pipeline_runs enable row level security;
alter table public.unknown_terms enable row level security;
