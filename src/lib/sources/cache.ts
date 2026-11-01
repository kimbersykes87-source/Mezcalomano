/**
 * Short in-memory hold for live source answers. Everyone who opens a page within
 * 60 seconds of each other shares one fetch, which keeps Shopify happy. The
 * "Refresh now" link adds ?fresh=<time> to bypass the hold, so a manual refresh
 * is always a true live fetch. The hold lives per server instance and is lost
 * whenever the instance restarts, which is fine.
 */

const HOLD_MS = 60_000;
type Entry = { at: number; value: unknown };
const store = new Map<string, Entry>();

export type Live<T> = { data: T; asOf: string };

export async function liveCached<T>(key: string, fresh: boolean, fn: () => Promise<T>): Promise<Live<T>> {
  const hit = store.get(key);
  if (!fresh && hit && Date.now() - hit.at < HOLD_MS) {
    return { data: hit.value as T, asOf: new Date(hit.at).toISOString() };
  }
  const value = await fn();
  const at = Date.now();
  store.set(key, { at, value });
  if (store.size > 50) {
    for (const [k, e] of store) if (at - e.at > HOLD_MS) store.delete(k);
  }
  return { data: value, asOf: new Date(at).toISOString() };
}

/** Result of one section of a page: the data, or a plain reason it could not load. */
export type Section<T> = { ok: true; data: T } | { ok: false; error: string };

export async function section<T>(fn: () => Promise<T>): Promise<Section<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg.slice(0, 200) };
  }
}
