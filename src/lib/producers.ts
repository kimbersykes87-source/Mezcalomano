import usShops from "../../data/us-shops.json";
import type { Species } from "@/types/species";

export type ProducerLink = {
  name: string;
  /** Absolute http(s) URL, or null when the producer has no link. */
  url: string | null;
  /** True when the link is on a shop that sells to US customers (data/us-shops.json). */
  us: boolean;
};

const US_HOSTS = new Set((usShops.hosts as string[]).map((h) => h.toLowerCase().replace(/^www\./, "")));

export function isUsShop(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return US_HOSTS.has(host);
  } catch {
    return false;
  }
}

/**
 * Pair each producer name with its link (same comma split as the CSV and seed script),
 * keeping the sheet's order within each group: US shops first, then everyone else.
 */
export function producerLinks(species: Pick<Species, "producers" | "producer_links">): ProducerLink[] {
  const names = (species.producers ?? "")
    .replace(/^"+|"+$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const links = (species.producer_links ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  const all = names.map((name, i) => {
    const raw = links[i];
    const url = raw && /^https?:\/\//.test(raw) ? raw : null;
    return { name, url, us: isUsShop(url) };
  });
  return [...all.filter((p) => p.us), ...all.filter((p) => !p.us)];
}
