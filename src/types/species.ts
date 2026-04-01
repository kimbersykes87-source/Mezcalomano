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
}
