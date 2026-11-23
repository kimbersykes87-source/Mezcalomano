-- Box QR scans. The QR on the Discovery Deck box is the plain address
-- https://mezcalomano.com/directory, so a scan cannot be told apart from any
-- other visit by its URL. A scan is counted when /directory is the first page
-- of a visit and the browser sent no referrer, once per browser session
-- (src/components/DirectoryScanBeacon.tsx > POST /api/qr-scan).
-- Counted from 2026-11-20 only; nothing is back filled.
-- No IP addresses or cookies are stored; crawlers are not saved at all.

create table if not exists public.qr_scans (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  country text,
  device text
);

create index if not exists qr_scans_created_idx on public.qr_scans (created_at);

alter table public.qr_scans enable row level security;

-- No policies: only the service role (server side) can read or write.
revoke all on table public.qr_scans from anon, authenticated;
