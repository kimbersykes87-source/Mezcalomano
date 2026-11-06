export interface Habitat {
  terrain: string;
}

export interface Species {
  id: string;
  species_id: number;
  /** URL segment when present; matches `toSlug(common_name)` after seed. Optional until DB migration. */
  slug?: string | null;
  common_name: string;
  scientific_name: string;
  size_height_feet: string | null;
  size_height_meters: string | null;
  habitat: Habitat | null;
  states: string | null;
  geo_region: string | null;
  mezcal_use: string | null;
  description: string | null;
  producers: string | null;
  producer_links: string | null;
  image_url: string | null;
  /** Directory fields added Nov 2026 (migration 20261106120000). Null until the CSV carries them. */
  taste_highlight?: string | null;
  nickname?: string | null;
  size_category?: string | null;
  management_category?: string | null;
  elevation_range?: string | null;
  conservation_status?: string | null;
}
