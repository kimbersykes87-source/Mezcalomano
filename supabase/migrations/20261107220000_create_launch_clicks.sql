-- Clicks on personal launch links (mezcalomano.com/g/p001 and so on).
-- Written server-side by src/app/g/[code]/route.ts with the service role only.
-- No IP addresses or cookies are stored. Link previews and crawlers are kept
-- but flagged is_bot, so a real tap can be told apart from WhatsApp opening
-- the link to build a preview.
create table if not exists public.launch_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  code text not null,
  is_bot boolean not null default false,
  country text,
  device text,
  user_agent text
);

create index if not exists launch_clicks_code_created_idx on public.launch_clicks (code, created_at);
create index if not exists launch_clicks_created_idx on public.launch_clicks (created_at);

alter table public.launch_clicks enable row level security;

-- No policies: anon and authenticated cannot read or write. Removing the
-- default grants also keeps the table out of the public GraphQL schema.
revoke all on table public.launch_clicks from anon, authenticated;
