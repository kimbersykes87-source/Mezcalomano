import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  // Stripe webhooks are intentionally disabled until Stripe is configured.
  // See docs/NEXT_STEPS.md
  return NextResponse.json({ ok: false, error: "Stripe not configured yet." }, { status: 501 });
}
