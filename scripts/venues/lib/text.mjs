// Text helpers shared by the venues pipeline. No network, no dependencies.

/** Lowercase, strip accents (NFD marks), keep letters, digits and spaces. */
export function foldAccents(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Folded text with every non alphanumeric run turned into one space, padded with spaces. */
export function toMatchText(input) {
  const folded = foldAccents(input).replace(/[^a-z0-9]+/g, " ").trim();
  return ` ${folded} `;
}

/** Normalized venue name used for entity resolution (drops generic words). */
const NAME_NOISE = new Set([
  "the", "el", "la", "los", "las", "de", "del", "bar", "restaurant", "restaurante",
  "cantina", "pub", "cafe", "taqueria", "and", "y", "co", "llc", "ltd", "sl",
]);
export function normalizeVenueName(name) {
  const tokens = foldAccents(name)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
  const kept = tokens.filter((t) => !NAME_NOISE.has(t));
  return (kept.length > 0 ? kept : tokens).join(" ");
}

/** Cap a stored menu line at 300 characters, on a word boundary when possible. */
export const MAX_LINE_CHARS = 300;
export function capLine(line, max = MAX_LINE_CHARS) {
  const clean = String(line ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ntilde: "ñ", Ntilde: "Ñ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", Aacute: "Á", Eacute: "É", Iacute: "Í",
  Oacute: "Ó", Uacute: "Ú", uuml: "ü", euro: "€", pound: "£", middot: "·", ndash: "-", mdash: "-" };

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => (n in ENTITIES ? ENTITIES[n] : m));
}

/**
 * Very small HTML to text converter. Headings become markdown "# " lines so the
 * extractor can use them as section context; block elements become lines.
 * Scripts, styles and noscript are dropped. Not a general HTML parser.
 */
export function htmlToText(html) {
  let h = String(html ?? "");
  h = h.replace(/<!--[\s\S]*?-->/g, " ");
  h = h.replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ");
  h = h.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, _n, inner) => `\n# ${inner.replace(/<[^>]+>/g, " ")}\n`);
  h = h.replace(/<\/(p|div|li|tr|section|article|ul|ol|table|dd|dt|figcaption|header|footer)>/gi, "\n");
  h = h.replace(/<(br|hr)\s*\/?>/gi, "\n");
  h = h.replace(/<\/(td|th)>/gi, "  ");
  h = h.replace(/<[^>]+>/g, " ");
  h = decodeEntities(h);
  return h
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** Does the HTML contain images but almost no text (menu posted as a picture)? */
export function looksImageOnly(html, text) {
  const imgCount = (String(html).match(/<img\b/gi) || []).length;
  return imgCount > 0 && String(text).replace(/\s+/g, "").length < 200;
}

/** SHA-256 hex of text, for the content hash on menu snapshots. */
import { createHash } from "node:crypto";
export function contentHash(text) {
  return createHash("sha256").update(String(text)).digest("hex");
}
