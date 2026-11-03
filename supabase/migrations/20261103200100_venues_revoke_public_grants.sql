-- Venues tables are service role only. Remove the default Supabase grants for
-- anon and authenticated so the tables are not even listed in the GraphQL
-- schema (advisor lints 0026 and 0027). RLS stays on as a second lock.
revoke all on table
  public.venues, public.venue_sources, public.venue_menu_snapshots,
  public.venue_claims, public.venue_reports, public.venue_submissions,
  public.merge_review, public.pipeline_runs, public.unknown_terms
from anon, authenticated;
