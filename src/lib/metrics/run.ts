import { collectCloudflare, CF_SITES } from "@/lib/metrics/cloudflare";
import { collectInstagram } from "@/lib/metrics/instagram";
import { collectClicks, collectContacts } from "@/lib/metrics/local";
import { collectEmailList, collectShop } from "@/lib/metrics/shopify";
import { collectTiktok } from "@/lib/metrics/tiktok";
import { logRun, saveMetrics, type MetricRow } from "@/lib/metrics/store";
import { londonDayRange, londonToday, londonYesterday } from "@/lib/metrics/time";

type Collector = (day: string, start: Date, end: Date) => Promise<MetricRow[]>;

const COLLECTORS: Record<string, Collector> = {
  web_main: (_d, s, e) => collectCloudflare(CF_SITES.web_main, s, e),
  web_shop: (_d, s, e) => collectCloudflare(CF_SITES.web_shop, s, e),
  shop: (d, s, e) => collectShop(d, s, e),
  email: (_d, s, e) => collectEmailList(s, e),
  contact: (_d, s, e) => collectContacts(s, e),
  clicks: (_d, s, e) => collectClicks(s, e),
  instagram: (_d, s, e) => collectInstagram(s, e),
  tiktok: () => collectTiktok(),
};

/** Sources that make sense for a day that is still in progress (Instagram and TikTok are level snapshots, not daily). */
const TODAY_SOURCES = ["web_main", "web_shop", "shop", "email", "contact", "clicks"];

/** Collect the given sources for one London day, one at a time, so one failure never blocks the rest. */
export async function collectDay(day: string, wanted?: string[]): Promise<Record<string, string>> {
  const names = Object.keys(COLLECTORS).filter((n) => !wanted?.length || wanted.includes(n));
  const { start, end } = londonDayRange(day);
  const results: Record<string, string> = {};
  for (const name of names) {
    try {
      const rows = await COLLECTORS[name](day, start, end);
      const saved = await saveMetrics(day, name, rows);
      results[name] = `ok (${saved} rows)`;
      await logRun(day, name, true, results[name]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results[name] = `error: ${message}`;
      console.error(`[collect] ${day} ${name}: ${message}`);
      await logRun(day, name, false, message);
    }
  }
  return results;
}

/** Yesterday (final) and today so far (partial, replaced on the next run). */
export async function collectLatest(): Promise<Record<string, Record<string, string>>> {
  const yesterday = londonYesterday();
  const today = londonToday();
  return {
    [yesterday]: await collectDay(yesterday),
    [today]: await collectDay(today, TODAY_SOURCES),
  };
}
