import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { shippingZones } from "@/db/schema";
import { createId } from "@/lib/ids";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const zoneId = String(formData.get("zoneId") ?? "");
  const name = String(formData.get("name") ?? "");
  const countriesCsv = String(formData.get("countriesCsv") ?? "");

  const db = getDb();
  const id = zoneId || createId("zone");
  const existing = await db.select().from(shippingZones).where(eq(shippingZones.id, id));
  if (existing[0]) {
    await db.update(shippingZones).set({ name, countriesCsv }).where(eq(shippingZones.id, id));
  } else {
    await db.insert(shippingZones).values({
      id,
      name,
      countriesCsv,
      isActive: 1,
      createdAt: Date.now(),
    });
  }

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "shipping.zone.upsert",
    targetType: "shipping_zone",
    targetId: id,
  });

  return NextResponse.redirect(new URL("/admin/shipping", request.url), { status: 303 });
}
