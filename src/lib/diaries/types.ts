/** One block of article body. Links inside text use [label](href); paths starting with / stay on the site. */
export type DiaryBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export interface DiaryEntry {
  slug: string;
  /** Page title and h1. Aim for under 60 characters and the exact search phrase. */
  title: string;
  /** Meta description, under 155 characters. */
  description: string;
  /** Small label above the title, for example "Gifts". */
  category: string;
  /** The two-sentence answer shown under the title. */
  answer: string;
  /** "draft" pages open at their URL with noindex but stay out of the list, menu and sitemap. */
  status: "draft" | "published";
  /** ISO date it went live. Required once published. */
  published?: string;
  /** ISO date of the last fact check. */
  updated: string;
  image: { src: string; alt: string; width: number; height: number };
  body: DiaryBlock[];
  faq: { q: string; a: string }[];
  /** Shown only on draft pages, for Kimber and Siona. */
  reviewNotes?: string[];
}
