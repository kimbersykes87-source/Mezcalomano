import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { addresses, customers, orders, orderItems, shipments } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "edge";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const db = getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.email, email));
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const orderRows = await db.select().from(orders).where(eq(orders.customerId, customer.id));
  const orderIds = orderRows.map((order) => order.id);
  const itemRows = orderIds.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)) : [];
  const shipmentRows = orderIds.length
    ? await db.select().from(shipments).where(inArray(shipments.orderId, orderIds))
    : [];
  const addressRows = await db.select().from(addresses).where(eq(addresses.customerId, customer.id));

  const payload = {
    customer,
    addresses: addressRows,
    orders: orderRows,
    orderItems: itemRows,
    shipments: shipmentRows,
  };

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "customer.export",
    targetType: "customer",
    targetId: customer.id,
  });

  return NextResponse.json(payload);
}
