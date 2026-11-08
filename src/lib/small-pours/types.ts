/** One block of article body. Links inside text use [label](href); paths starting with / stay on the site. */
export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export interface PostEntry {
  slug: string;
  /** Page title and h1. Aim for under 60 characters and the exact search phrase. */
  title: string;
  /** Meta description, under 155 characters. */
  description: string;
  /** Small label above the title, for example "Gifts". */
  category: string;
  /** The two-sentence answer shown under the title. */
  answer: string;
  /**
   * "draft"     opens at its URL with noindex, and stays out of the list, menu and sitemap.
   * "review"    is listed on the contents page and keeps the review banner, still noindex and
   *             still out of the menu and sitemap. For walking the batch before sign off.
   * "published" is public: no banner, indexed, in the menu and the sitemap.
   */
  status: "draft" | "review" | "published";
  /** ISO date it went live. Required once published. */
  published?: string;
  /** ISO date of the last fact check. */
  updated: string;
  image: { src: string; alt: string; width: number; height: number };
  body: PostBlock[];
  faq: { q: string; a: string }[];
  /** Shown only on draft pages, for Kimber and Siona. */
  reviewNotes?: string[];
}
