import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { sendMagicLink } from "@/lib/email";
import { createMagicToken } from "@/lib/sessions";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const turnstileToken = String(formData.get("turnstileToken") ?? "");
  const clientIp = request.headers.get("cf-connecting-ip");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const valid = await verifyTurnstile(turnstileToken, clientIp);
  if (!valid) {
    return NextResponse.json({ error: "Invalid Turnstile" }, { status: 400 });
  }

  const token = await createMagicToken("customer", email, 60 * 10);
  const link = `${env.NEXT_PUBLIC_SITE_URL}/account/magic?token=${token}`;
  await sendMagicLink({ to: email, magicLink: link });

  return NextResponse.redirect(new URL("/account/login?sent=1", env.NEXT_PUBLIC_SITE_URL), { status: 303 });
}
