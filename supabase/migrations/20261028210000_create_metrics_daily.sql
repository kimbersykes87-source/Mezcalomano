-- Daily figures for the admin dashboard (admin.mezcalomano.com) and the Monday email.
-- Written by the nightly job /api/cron/daily with the service role only.
-- day = London calendar day. dimension = '' for a headline figure, otherwise
-- a page path, referrer, country, SKU, species and so on.
create table if not exists public.metrics_daily (
  day date not null,
  source text not null,
  metric text not null,
  dimension text not null default '',
  value numeric not null,
  updated_at timestamptz not null default now(),
  primary key (day, source, metric, dimension)
);

create index if not exists metrics_daily_source_metric_day_idx
  on public.metrics_daily (source, metric, day);

alter table public.metrics_daily enable row level security;

-- One row per source per run, so failures are visible.
create table if not exists public.metrics_runs (
  id bigint generated always as identity primary key,
  ran_at timestamptz not null default now(),
  day date not null,
  source text not null,
  ok boolean not null,
  detail text
);

create index if not exists metrics_runs_ran_at_idx on public.metrics_runs (ran_at);

alter table public.metrics_runs enable row level security;

-- No policies: anon/authenticated cannot read or write.
