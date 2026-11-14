import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { PRESS_LINK_BASE, pressDb, slugify } from "@/lib/press-links";

/**
 * Called by the launch tracker sheet ("Tracked links" > "Make links for new Said yes").
 * Auth: header Authorization: Bearer <PRESS_LINKS_SECRET> (Vercel env var, also in the
 * sheet script's Script Properties).
 *
 * Body: { links: [{ promo_id, name, outlet }] }  (at most 200)
 * Returns: { links: [{ promo_id, slug, url, created }] }
 *
 * Never changes a link: if a row's promo_id already has a link, that same link
 * comes back (created: false). New links get a slug from the outlet or handle,
 * with -2, -3 and so on added if it is taken.
 */

export const dynamic = "force-dynamic";

type In = { promo_id?: unknown; name?: unknown; outlet?: unknown };
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function authorised(request: Request): boolean {
  const secret = process.env.PRESS_LINKS_SECRET?.trim();
  if (!secret || secret.length < 24) return false;
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const db = pressDb();
  if (!db) return NextResponse.json({ error: "Database not configured" }, { status: 500 });

  let body: { links?: In[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const items = Array.isArray(body.links) ? body.links.slice(0, 200) : [];
  const out: { promo_id: string; slug: string; url: string; created: boolean }[] = [];
  const errors: { promo_id: string; error: string }[] = [];

  for (const it of items) {
    const promoId = str(it.promo_id, 40);
    const name = str(it.name, 120);
    const outlet = str(it.outlet, 120);
    if (!promoId) {
      errors.push({ promo_id: "", error: "Row has no ID" });
      continue;
    }

    const { data: existing, error: readErr } = await db.from("press_links").select("slug").eq("promo_id", promoId).maybeSingle();
    if (readErr) {
      errors.push({ promo_id: promoId, error: readErr.message });
      continue;
    }
    if (existing) {
      out.push({ promo_id: promoId, slug: existing.slug, url: PRESS_LINK_BASE + existing.slug, created: false });
      continue;
    }

    const base = slugify(outlet || name || promoId);
    let made: string | null = null;
    for (let n = 1; n <= 50 && !made; n++) {
      const slug = n === 1 ? base : `${base}-${n}`;
      const { error } = await db.from("press_links").insert({ slug, promo_id: promoId, name: name || null, outlet: outlet || null });
      if (!error) made = slug;
      else if (error.code !== "23505") {
        errors.push({ promo_id: promoId, error: error.message });
        break;
      } else {
        // 23505: slug taken, or this promo_id was made a moment ago by another run.
        const { data: again } = await db.from("press_links").select("slug").eq("promo_id", promoId).maybeSingle();
        if (again) {
          out.push({ promo_id: promoId, slug: again.slug, url: PRESS_LINK_BASE + again.slug, created: false });
          break;
        }
      }
    }
    if (made) out.push({ promo_id: promoId, slug: made, url: PRESS_LINK_BASE + made, created: true });
  }

  return NextResponse.json({ links: out, errors });
}
