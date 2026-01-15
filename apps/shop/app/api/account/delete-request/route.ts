import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  await writeAuditLog({
    actorType: "customer",
    actorId: email,
    action: "customer.deletion_requested",
    targetType: "customer",
    targetId: email,
  });

  return NextResponse.redirect(new URL("/account", request.url), { status: 303 });
}
