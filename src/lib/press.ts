import pressImages from "../../data/press-images.json";

/** Press kit zip, built by `npm run build:press-kit`. */
export const PRESS_KIT_ZIP = "/press/mezcalomano-press-kit.zip";

/**
 * Alt text for each press photo, keyed by file name in public/press/photos/.
 * Do not add photos that show the jacks or the box QR code.
 */
const ALT_TEXT: Record<string, string> = {
  "shop-pdp-01-box-card.jpg": "The Discovery Deck box with an agave card.",
  "shop-pdp-02-grid-box.jpg": "A grid of Discovery Deck agave cards beside the box.",
  "shop-pdp-03-box-front.jpg": "The front of the Discovery Deck box.",
  "shop-pdp-04-guides.jpg": "The two reference cards: the flavor guide and taxonomy notes.",
  "shop-pdp-05-madrecuixe.jpg": "The Madrecuixe agave card.",
  "shop-pdp-07-backs.jpg": "The card backs of the Discovery Deck.",
};

export type PressImage = {
  file: string;
  src: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
};

export const PRESS_IMAGES: PressImage[] = (
  pressImages as { file: string; width: number; height: number; bytes: number }[]
).map((img) => ({
  ...img,
  src: `/press/photos/${img.file}`,
  alt: ALT_TEXT[img.file] ?? "The Mezcalómano Discovery Deck.",
}));

export const PRESS_LOGOS = [
  { label: "Logo for light backgrounds, PNG", href: "/press/logos/mezcalomano-logo-for-light-backgrounds.png" },
  { label: "Logo for dark backgrounds, PNG", href: "/press/logos/mezcalomano-logo-for-dark-backgrounds.png" },
  { label: "Logo for light backgrounds, SVG", href: "/press/logos/mezcalomano-logo-for-light-backgrounds.svg" },
  { label: "Logo for dark backgrounds, SVG", href: "/press/logos/mezcalomano-logo-for-dark-backgrounds.svg" },
];

export function formatMegabytes(bytes: number): string {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}
