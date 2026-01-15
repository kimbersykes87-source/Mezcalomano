import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { sendMagicLink } from "@/lib/email";
import { createMagicToken } from "@/lib/sessions";
import { verifyTurnstile } from "@/lib/turnstile";

const parseAllowlist = () =>
  env.ADMIN_EMAIL_ALLOWLIST?.split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean) ?? [];

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const turnstileToken = String(formData.get("turnstileToken") ?? "");
  const clientIp = request.headers.get("cf-connecting-ip");

  const allowlist = parseAllowlist();
  if (!allowlist.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const valid = await verifyTurnstile(turnstileToken, clientIp);
  if (!valid) {
    return NextResponse.json({ error: "Invalid Turnstile" }, { status: 400 });
  }

  const token = await createMagicToken("admin", email, 60 * 10);
  const link = `${env.NEXT_PUBLIC_SITE_URL}/admin/magic?token=${token}`;
  await sendMagicLink({ to: email, magicLink: link });

  return NextResponse.redirect(new URL("/admin/login?sent=1", env.NEXT_PUBLIC_SITE_URL), { status: 303 });
}
