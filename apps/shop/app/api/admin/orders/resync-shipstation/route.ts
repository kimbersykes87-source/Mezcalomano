import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { createShipStationOrder } from "@/lib/shipstation";
import { getDb } from "@/db";
import { addresses, orderItems, orders, products, shipments } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { createId } from "@/lib/ids";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "");
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const productIds = items.map((item) => item.productId).filter(Boolean) as string[];
  const productRows = productIds.length ? await db.select().from(products).where(inArray(products.id, productIds)) : [];

  const addressRows = await db.select().from(addresses).where(eq(addresses.orderId, order.id));
  const shippingAddress = addressRows.find((addr) => addr.type === "shipping");
  const billingAddress = addressRows.find((addr) => addr.type === "billing");

  const shipTo = {
    name: shippingAddress?.name ?? "Customer",
    street1: shippingAddress?.line1 ?? "",
    street2: shippingAddress?.line2 ?? null,
    city: shippingAddress?.city ?? "",
    state: shippingAddress?.state ?? null,
    postalCode: shippingAddress?.postalCode ?? "",
    country: shippingAddress?.country ?? "",
    phone: shippingAddress?.phone ?? null,
  };
  const billTo = {
    name: billingAddress?.name ?? "Customer",
    street1: billingAddress?.line1 ?? "",
    street2: billingAddress?.line2 ?? null,
    city: billingAddress?.city ?? "",
    state: billingAddress?.state ?? null,
    postalCode: billingAddress?.postalCode ?? "",
    country: billingAddress?.country ?? "",
    phone: billingAddress?.phone ?? null,
  };

  const itemsForShipStation = items.map((item) => {
    const product = productRows.find((row) => row.id === item.productId);
    return {
      lineItemKey: item.id,
      sku: item.productId ?? "unknown",
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitAmount / 100,
      weight: { value: product?.weightGrams ?? 150, units: "grams" as const },
      productId: item.productId,
    };
  });

  const isInternational = (shipTo.country ?? "").toUpperCase() !== "US";
  const internationalOptions = isInternational
    ? {
        contents: "merchandise" as const,
        customsItems: itemsForShipStation.map((item) => ({
          description: item.name,
          quantity: item.quantity,
          value: item.unitPrice,
          harmonizedTariffCode: productRows.find((row) => row.id === item.productId)?.hsCode ?? "9504400000",
          countryOfOrigin: productRows.find((row) => row.id === item.productId)?.originCountry ?? "US",
        })),
      }
    : undefined;

  const shipStation = await createShipStationOrder({
    orderNumber: order.id,
    orderKey: order.id,
    orderDate: new Date(order.createdAt ?? Date.now()).toISOString(),
    orderStatus: "awaiting_shipment",
    customerEmail: order.customerEmail ?? "unknown@example.com",
    billTo,
    shipTo,
    items: itemsForShipStation,
    amountPaid: order.totalAmount / 100,
    taxAmount: order.taxAmount / 100,
    shippingAmount: order.shippingAmount / 100,
    requestedShippingService: order.shippingService ?? null,
    advancedOptions: { storeId: Number(env.SHIPSTATION_STORE_ID) },
    internationalOptions,
  });

  await db.insert(shipments).values({
    id: createId("shp"),
    orderId: order.id,
    status: "created",
    shipStationOrderId: String(shipStation.orderId),
    createdAt: Date.now(),
  });

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "order.shipstation_resync",
    targetType: "order",
    targetId: order.id,
  });

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
