import type { PostBlock } from "./types";
import { MEXICO_STATE_NAMES, linkableStateNames, stateSlug } from "@/lib/map-utils";

/** State names a post may mention. "México" and "Distrito Federal" are excluded upstream. */
const STATES = linkableStateNames(MEXICO_STATE_NAMES);

/** Split text into the bits outside markdown links and the links themselves, so we never nest links. */
function outsideLinks(text: string): { chunk: string; linkable: boolean }[] {
  const parts: { chunk: string; linkable: boolean }[] = [];
  const re = /\[[^\]]*\]\([^)]*\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ chunk: text.slice(last, m.index), linkable: true });
    parts.push({ chunk: m[0], linkable: false });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ chunk: text.slice(last), linkable: true });
  return parts;
}

function linkFirst(text: string, done: Set<string>): string {
  return outsideLinks(text)
    .map(({ chunk, linkable }) => {
      if (!linkable) return chunk;
      let out = chunk;
      for (const { name, slug } of STATES) {
        if (done.has(slug)) continue;
        const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\p{L}\\p{N}])`, "u");
        const hit = re.exec(out);
        if (!hit) continue;
        done.add(slug);
        out = out.slice(0, hit.index) + hit[1] + `[${hit[2]}](/map?state=${slug})` + out.slice(hit.index + hit[0].length);
      }
      return out;
    })
    .join("");
}

/**
 * Link the first mention of each Mexican state in a post body to the map, filtered to that state.
 * Headings are left alone, and an existing link is never wrapped in another.
 */
export function autoLinkStates(body: PostBlock[]): PostBlock[] {
  const done = new Set<string>();
  return body.map((b) => {
    if (b.type === "p") return { ...b, text: linkFirst(b.text, done) };
    if (b.type === "list") return { ...b, items: b.items.map((i) => linkFirst(i, done)) };
    if (b.type === "table") return { ...b, rows: b.rows.map((r) => r.map((c) => linkFirst(c, done))) };
    return b;
  });
}

export { stateSlug };
