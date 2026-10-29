import { producerLinks } from "@/lib/producers";
import { speciesDirectorySlug } from "@/lib/slug";
import type { Species } from "@/types/species";

/** What the directory grid, fan and species rail need for one agave. */
export type AgaveCard = {
  slug: string;
  name: string;
  sci: string;
  img: string | null;
  /** Producers whose link is a shop that sells to US customers. */
  usCount: number;
  wild: boolean;
  states: string[];
};

export function parseStates(states: string | null | undefined): string[] {
  return (states ?? "")
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "en"));
}

/** `img` is the resolved plant image (matrix card cut-out, else the Supabase image_url). */
export function toAgaveCard(s: Species, img: string | null): AgaveCard {
  return {
    slug: speciesDirectorySlug(s),
    name: s.common_name,
    sci: s.scientific_name,
    img: img ?? s.image_url ?? null,
    usCount: producerLinks(s).filter((p) => p.us).length,
    wild: /wild/i.test(s.mezcal_use ?? ""),
    states: parseStates(s.states),
  };
}
