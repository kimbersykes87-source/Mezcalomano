import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderConfirmation } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "");
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));

  if (!order?.customerEmail) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await sendOrderConfirmation({
    to: order.customerEmail,
    orderId: order.id,
    totalAmount: order.totalAmount,
    currency: order.currency,
  });

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "order.email_resend",
    targetType: "order",
    targetId: order.id,
  });

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
