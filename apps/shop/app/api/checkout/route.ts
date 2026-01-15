import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  return NextResponse.json(
    {
      error: "Checkout not configured yet.",
      nextSteps: "Configure Stripe and enable checkout (see docs/NEXT_STEPS.md).",
    },
    { status: 501 },
  );
}
