-- Monday 08:00 London email. pg_cron calls the site at 07:00 and 08:00 UTC on
-- Mondays; the route only sends on the call that is 08:00 in London (so it
-- follows the clock change) and only once per week.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Trigger token made inside the database; nobody needs to see it.
insert into public.admin_tokens (provider, account_name, token)
values ('weekly_trigger', 'pg_cron', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (provider) do nothing;

select cron.unschedule(jobid) from cron.job where jobname = 'mm-weekly-email';

select cron.schedule(
  'mm-weekly-email',
  '0 7,8 * * 1',
  $$
  select net.http_get(
    url := 'https://mezcalomano.com/api/cron/weekly',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select token from public.admin_tokens where provider = 'weekly_trigger')
    ),
    timeout_milliseconds := 60000
  );
  $$
);
