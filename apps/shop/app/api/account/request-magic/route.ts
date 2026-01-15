import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { ok: false, error: "Account emails not configured yet. See docs/NEXT_STEPS.md" },
    { status: 501 },
  );
}
