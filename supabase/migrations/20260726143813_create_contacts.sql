-- Contact form submissions (written server-side via service role only)
create table if not exists public.contacts (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

-- No policies: anon/authenticated cannot read or write.
-- The Next.js API route inserts/updates with the service-role key (bypasses RLS).
