-- Tracked links for press and creators: mezcalomano.com/r/<slug>.
-- Links are made from the launch tracker sheet ("Tracked links" menu), which
-- calls POST /api/press-links. A link, once made, never changes: the slug and
-- who it belongs to cannot be updated, and links cannot be deleted (a trigger
-- refuses both, even for the service role).
-- Clicks are written by src/app/r/[slug]/route.ts with the service role only.
-- No IP addresses or cookies are stored; crawlers and mail link scanners are
-- kept but flagged is_bot.

create table if not exists public.press_links (
  slug text primary key check (slug ~ '^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$'),
  promo_id text,
  name text,
  outlet text,
  created_at timestamptz not null default now()
);

create unique index if not exists press_links_promo_id_idx on public.press_links (promo_id) where promo_id is not null;

create or replace function public.press_links_freeze()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'press_links rows cannot be deleted (links already handed out)';
  end if;
  if new.slug is distinct from old.slug or new.promo_id is distinct from old.promo_id
     or new.created_at is distinct from old.created_at then
    raise exception 'press_links slug, promo_id and created_at cannot change';
  end if;
  return new;
end;
$$;

drop trigger if exists press_links_freeze on public.press_links;
create trigger press_links_freeze
  before update or delete on public.press_links
  for each row execute function public.press_links_freeze();

create table if not exists public.press_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  slug text not null references public.press_links (slug),
  is_bot boolean not null default false,
  country text,
  device text,
  referrer_host text,
  user_agent text
);

create index if not exists press_clicks_slug_created_idx on public.press_clicks (slug, created_at);
create index if not exists press_clicks_created_idx on public.press_clicks (created_at);

alter table public.press_links enable row level security;
alter table public.press_clicks enable row level security;

-- No policies: only the service role (server side) can read or write.
revoke all on table public.press_links from anon, authenticated;
revoke all on table public.press_clicks from anon, authenticated;
revoke all on function public.press_links_freeze() from public, anon, authenticated;
