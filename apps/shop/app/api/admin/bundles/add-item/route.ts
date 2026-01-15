import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { bundleItems } from "@/db/schema";
import { createId } from "@/lib/ids";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "edge";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const bundleId = String(formData.get("bundleId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);

  const db = getDb();
  await db.insert(bundleItems).values({
    id: createId("bundle_item"),
    bundleId,
    productId,
    quantity: Number.isFinite(quantity) ? quantity : 1,
  });

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "bundle.add_item",
    targetType: "bundle",
    targetId: bundleId,
    metadata: { productId, quantity },
  });

  return NextResponse.redirect(new URL("/admin/bundles", request.url), { status: 303 });
}
