import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { consumeMagicToken, createSession } from "@/lib/sessions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", env.NEXT_PUBLIC_SITE_URL));
  }

  const record = await consumeMagicToken("admin", token);
  if (!record) {
    return NextResponse.redirect(new URL("/admin/login", env.NEXT_PUBLIC_SITE_URL));
  }

  const sessionToken = await createSession("admin", record.email, 60 * 60 * 8);
  const response = NextResponse.redirect(new URL("/admin", env.NEXT_PUBLIC_SITE_URL));
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: true,
  });
  return response;
}
