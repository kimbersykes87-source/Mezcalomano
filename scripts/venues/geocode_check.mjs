// Stage 3: geocode check. Compares each source point with the address geocode.
// More than 100 m apart goes to review (closed_signals gets a pin_mismatch entry).
// Nominatim is used only here and for submissions: 1 request per second, identifying user agent.
//
//   node scripts/venues/geocode_check.mjs [--limit 20] [--dry-run]

import { pinCheck } from "./lib/geo.mjs";
import { USER_AGENT } from "./lib/robots.mjs";
import { throttle } from "./lib/http.mjs";
import { runStage } from "./lib/stage.mjs";

async function nominatim(address) {
  await throttle("nominatim.openstreetmap.org");
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`, {
    headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ? { lat: Number(rows[0].lat), lng: Number(rows[0].lon) } : null;
}

runStage("geocode_check", async (ctx) => {
  const { db, args } = ctx;
  if (!db) return "no database env: nothing to do (dry run)";
  const limit = Number(args.limit || 20);
  const { data: venues } = await db.from("venues").select("id,address,lat,lng,closed_signals").is("pin_verified_at", null).not("address", "is", null).not("lat", "is", null).limit(limit);
  for (const v of venues || []) {
    const point = await nominatim(v.address).catch(() => null);
    if (!point) { ctx.count("no_geocode"); continue; }
    const { meters, ok } = pinCheck(v, point);
    if (ok) {
      await db.from("venues").update({ pin_verified_at: new Date().toISOString() }).eq("id", v.id);
      ctx.count("pin_ok");
    } else {
      const signals = [...(v.closed_signals || []), { type: "pin_mismatch", meters: Math.round(meters), at: new Date().toISOString(), resolved: false }];
      await db.from("venues").update({ closed_signals: signals }).eq("id", v.id);
      ctx.count("pin_mismatch_for_review");
    }
  }
});
