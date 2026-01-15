import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { consentLog } from "@/db/schema";
import { createId } from "@/lib/ids";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { consent?: string } | null;
  const consent = body?.consent === "accepted" ? "accepted" : "rejected";
  const region =
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-vercel-ip-country") ??
    "unknown";
  const sessionId = request.headers.get("x-session-id") ?? "anon";
  const ipAddress = request.headers.get("cf-connecting-ip") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;

  const db = getDb();
  await db.insert(consentLog).values({
    id: createId("consent"),
    sessionId,
    region,
    consentStatus: consent,
    userAgent,
    ipAddress,
    createdAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}
