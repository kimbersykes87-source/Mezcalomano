import pressImages from "../../data/press-images.json";

/** Press kit zip, built by `npm run build:press-kit`. */
export const PRESS_KIT_ZIP = "/press/mezcalomano-press-kit.zip";

/**
 * Alt text for each press photo, keyed by file name in public/press/photos/.
 * Do not add photos that show the jacks or the box QR code.
 */
const ALT_TEXT: Record<string, string> = {
  "mezcalomano-press-01-four-agave-cards.jpg":
    "A hand fanning four Discovery Deck agave cards, Madrecuixe, Castilla, Sierra Negra and Pulquero, over a spiky agave plant.",
  "mezcalomano-press-02-alto-card.jpg":
    "A hand holding the 9 of spades, the Alto agave card nicknamed Soaring Monarch, against a soft green background.",
  "mezcalomano-press-03-oaxaca-tahona.jpg":
    "A stone tahona wheel resting on a pit of roasted agave at a palenque in Oaxaca.",
  "mezcalomano-press-04-jokers-and-backs.jpg":
    "The two pollinator jokers and the patterned card backs of the Discovery Deck laid out on pine needles and rock.",
  "mezcalomano-press-05-masparillo-card.jpg":
    "The 7 of spades, the Masparillo agave card nicknamed Crag Ripper, propped against a rock.",
  "mezcalomano-press-06-oaxaca-hierve-el-agua.jpg":
    "The view from Hierve el Agua in Oaxaca, with green valleys and layered mountains under a cloudy sky.",
};

export type PressImage = {
  file: string;
  src: string;
  thumbSrc: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
};

export const PRESS_IMAGES: PressImage[] = (
  pressImages as { file: string; thumb: string; width: number; height: number; bytes: number }[]
).map((img) => ({
  ...img,
  src: `/press/photos/${img.file}`,
  thumbSrc: `/press/thumbs/${img.thumb}`,
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
