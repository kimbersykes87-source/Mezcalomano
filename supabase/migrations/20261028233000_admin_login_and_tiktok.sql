-- Admin login attempts (for the lockout after repeated failures).
create table if not exists public.admin_login_attempts (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  ok boolean not null
);
create index if not exists admin_login_attempts_at_idx on public.admin_login_attempts (at);
alter table public.admin_login_attempts enable row level security;

-- TikTok keeps a separate refresh token.
alter table public.admin_tokens add column if not exists refresh_token text;
alter table public.admin_tokens add column if not exists refresh_expires_at timestamptz;

-- No policies: service role only.
