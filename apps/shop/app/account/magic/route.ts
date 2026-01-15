import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { consumeMagicToken, createSession } from "@/lib/sessions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/account/login", env.NEXT_PUBLIC_SITE_URL));
  }

  const record = await consumeMagicToken("customer", token);
  if (!record) {
    return NextResponse.redirect(new URL("/account/login", env.NEXT_PUBLIC_SITE_URL));
  }

  const sessionToken = await createSession("customer", record.email, 60 * 60 * 24 * 7);
  const response = NextResponse.redirect(new URL("/account", env.NEXT_PUBLIC_SITE_URL));
  response.cookies.set("customer_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: true,
  });
  return response;
}
