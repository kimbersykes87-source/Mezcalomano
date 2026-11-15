-- Venues directory plan v3, Phase 1: additive fields only. Nothing existing is changed or dropped.
-- venue_type and chain_status show on every card. Licence fields come from state licence lists.
-- source_kind records whether a claim came from a bar menu line or a store catalog product.

alter table public.venues
  add column if not exists venue_type text
    check (venue_type is null or venue_type in ('store', 'bar', 'restaurant')),
  add column if not exists chain_status text not null default 'unknown'
    check (chain_status in ('independent', 'chain', 'unknown')),
  add column if not exists licence_state text
    check (licence_state is null or char_length(licence_state) = 2),
  add column if not exists licence_number text,
  add column if not exists licence_type text,
  add column if not exists licence_status text
    check (licence_status is null or licence_status in ('active', 'expired', 'suspended', 'surrendered', 'unknown')),
  add column if not exists licence_expires_on date,
  add column if not exists licence_checked_at timestamptz,
  add column if not exists auto_published_at timestamptz;

create unique index if not exists venues_licence_uidx
  on public.venues (licence_state, licence_number)
  where licence_state is not null and licence_number is not null;
create index if not exists venues_type_status_idx on public.venues (venue_type, status);

alter table public.venue_claims
  add column if not exists source_kind text not null default 'menu_line'
    check (source_kind in ('menu_line', 'catalog_product', 'owner', 'community'));

comment on column public.venues.chain_status is 'independent, chain (4 or more US locations by normalized name or domain, or national chain list), or unknown';
comment on column public.venue_claims.source_kind is 'menu_line for bars and restaurants, catalog_product for store online catalogs. Store claims expire after 60 days, bar claims after 12 months unless reconfirmed.';
