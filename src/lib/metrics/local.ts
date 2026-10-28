import { serviceClient, type MetricRow } from "./store";

/** Contact form messages and outbound link clicks, from our own Supabase tables. */

export async function collectContacts(start: Date, end: Date): Promise<MetricRow[]> {
  const { count, error } = await serviceClient()
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());
  if (error) throw new Error(`contacts: ${error.message}`);
  return [{ metric: "messages", value: count ?? 0 }];
}

export async function collectClicks(start: Date, end: Date): Promise<MetricRow[]> {
  const { data, error } = await serviceClient()
    .from("events")
    .select("target_host, species_slug, link_group, path")
    .eq("type", "outbound_click")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString())
    .limit(20000);
  if (error) throw new Error(`events: ${error.message}`);

  const rows: MetricRow[] = [{ metric: "clicks", value: data?.length ?? 0 }];
  for (const e of data ?? []) {
    rows.push({ metric: "clicks_by_host", dimension: e.target_host ?? "(unknown)", value: 1 });
    if (e.species_slug) {
      rows.push({ metric: "producer_clicks_by_species", dimension: e.species_slug, value: 1 });
      rows.push({ metric: "producer_clicks_by_group", dimension: e.link_group ?? "(none)", value: 1 });
    }
  }
  return rows;
}
