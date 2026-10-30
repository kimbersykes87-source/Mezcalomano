import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Returns the visitor's country (two-letter code) from Vercel's IP lookup, or null when
 * unknown (local dev, previews without geo). Used by the international delivery banner.
 * Nothing is stored. Never cached, because the answer differs per visitor.
 */
export function GET(request: Request) {
  const raw = (request.headers.get("x-vercel-ip-country") ?? "").trim().toUpperCase();
  const country = /^[A-Z]{2}$/.test(raw) ? raw : null;
  return NextResponse.json(
    { country },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
