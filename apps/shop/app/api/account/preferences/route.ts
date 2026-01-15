import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  const optIn = formData.get("optIn") === "on" ? 1 : 0;
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const db = getDb();
  await db.update(customers).set({ marketingOptIn: optIn, updatedAt: Date.now() }).where(eq(customers.email, email));

  await writeAuditLog({
    actorType: "customer",
    actorId: email,
    action: "marketing.opt_in.updated",
    targetType: "customer",
    targetId: email,
    metadata: { optIn },
  });

  return NextResponse.redirect(new URL("/account", request.url), { status: 303 });
}
