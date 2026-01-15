import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { shippingRates } from "@/db/schema";
import { createId } from "@/lib/ids";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "edge";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const rateId = String(formData.get("rateId") ?? "");
  const zoneId = String(formData.get("zoneId") ?? "");
  const serviceLevel = String(formData.get("serviceLevel") ?? "");
  const currency = String(formData.get("currency") ?? "USD").toUpperCase();
  const amount = Number(formData.get("amount") ?? 0);
  const minDays = formData.get("minDays") ? Number(formData.get("minDays")) : null;
  const maxDays = formData.get("maxDays") ? Number(formData.get("maxDays")) : null;

  const db = getDb();
  const id = rateId || createId("rate");
  const existing = await db.select().from(shippingRates).where(eq(shippingRates.id, id));
  if (existing[0]) {
    await db
      .update(shippingRates)
      .set({ zoneId, serviceLevel, currency, amount, minDays, maxDays })
      .where(eq(shippingRates.id, id));
  } else {
    await db.insert(shippingRates).values({
      id,
      zoneId,
      serviceLevel,
      currency,
      amount,
      minDays,
      maxDays,
      isActive: 1,
      createdAt: Date.now(),
    });
  }

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "shipping.rate.upsert",
    targetType: "shipping_rate",
    targetId: id,
  });

  return NextResponse.redirect(new URL("/admin/shipping", request.url), { status: 303 });
}
