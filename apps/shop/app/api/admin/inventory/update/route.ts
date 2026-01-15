import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { inventory } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "edge";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const productId = String(formData.get("productId") ?? "");
  const onHand = Number(formData.get("onHand") ?? 0);

  const db = getDb();
  await db.update(inventory).set({ onHand, updatedAt: Date.now() }).where(eq(inventory.productId, productId));

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "inventory.update",
    targetType: "product",
    targetId: productId,
    metadata: { onHand },
  });

  return NextResponse.redirect(new URL("/admin/products", request.url), { status: 303 });
}
