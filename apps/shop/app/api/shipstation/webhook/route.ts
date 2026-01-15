import { NextResponse } from "next/server";

export async function POST() {
  // ShipStation webhooks are intentionally disabled until ShipStation is configured.
  // See docs/NEXT_STEPS.md
  return NextResponse.json({ ok: false, error: "ShipStation not configured yet." }, { status: 501 });
}
