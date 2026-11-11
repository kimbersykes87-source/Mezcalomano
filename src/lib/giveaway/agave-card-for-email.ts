// Maps an entrant's email to one of the 40 agave cards.
// Deterministic: the same address always draws the same card, so a reload
// does not reshuffle it. Cosmetic only: it has nothing to do with winning.
//
// DO NOT REORDER THIS LIST. The mapping is by position, so moving a name
// silently changes the card every existing entrant has already been shown.
// It is frozen here on purpose rather than read from Species_Final.csv.
import { toSlug } from "@/lib/slug";

export const AGAVE_CARDS = [
  "Espadín", "Tobalá", "Tepextate", "Cuishe",
  "Barril", "Madrecuixe", "Bicuixe", "Tobaziche",
  "Lumbre", "Montana", "Arroqueño", "Sierra Negra",
  "Coyote", "Mexicano", "Masparillo", "Papalote",
  "Alto", "Salmiana", "Cimarrón", "Cenizo",
  "Manso Sahuayo", "Lyobaa Coyote", "Churique", "Weber Azul",
  "Verde", "Warash", "Rayo", "Henequén",
  "Pacífica", "Wocomahi", "Jabalí", "Lamparillo",
  "Tepemete", "Chahuiqui", "Espadilla", "Cincoañero",
  "Castilla", "Chuparrosa", "Pulquero", "Pulque Chino",
] as const;

/** FNV-1a, 32 bit. Dependency free, and identical in Node and the browser. */
function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function normaliseEmail(email: string): string {
  return (email ?? "").trim().toLowerCase();
}

/** index, display name and directory slug (the slug also names the video and still on media.mezcalomano.com). */
export function agaveCardForEmail(email: string): { index: number; name: string; slug: string } | null {
  const key = normaliseEmail(email);
  if (!key) return null;
  const index = hash32(key) % AGAVE_CARDS.length;
  const name = AGAVE_CARDS[index];
  return { index, name, slug: toSlug(name) };
}
