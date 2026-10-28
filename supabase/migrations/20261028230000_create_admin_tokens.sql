-- Access tokens the analytics job needs that rotate on their own (Instagram's
-- long-lived token lasts 60 days and is refreshed by the nightly job).
-- Service role only: never readable from the browser.
create table if not exists public.admin_tokens (
  provider text primary key,
  account_id text,
  account_name text,
  token text not null,
  expires_at timestamptz,
  refreshed_at timestamptz not null default now()
);

alter table public.admin_tokens enable row level security;

-- No policies: anon/authenticated cannot read or write.
