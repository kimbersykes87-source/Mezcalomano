import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { orders, shipments, webhooksLog } from "@/db/schema";
import { createId } from "@/lib/ids";
import { sendShippingConfirmation } from "@/lib/email";
import { verifyShipStationSignature } from "@/lib/shipstation";

const toTimestamp = () => Date.now();

export async function POST(request: Request) {
  const signature = request.headers.get("x-shipstation-hmac-sha256") ?? "";
  const body = await request.text();

  if (!signature || !verifyShipStationSignature(body, signature)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const payload = JSON.parse(body) as Record<string, unknown>;
  const shipStationOrderId =
    (payload.orderId as number | undefined) ??
    (payload.order_id as number | undefined) ??
    (payload.resource_id as number | undefined);
  const shipStationShipmentId =
    (payload.shipmentId as number | undefined) ?? (payload.shipment_id as number | undefined);
  const trackingNumber =
    (payload.trackingNumber as string | undefined) ?? (payload.tracking_number as string | undefined);
  const carrier = (payload.carrierCode as string | undefined) ?? (payload.carrier_code as string | undefined);
  const service = (payload.serviceCode as string | undefined) ?? (payload.service_code as string | undefined);
  const status = (payload.status as string | undefined) ?? "shipped";

  const db = getDb();
  const webhookId = createId("wh");
  await db.insert(webhooksLog).values({
    id: webhookId,
    provider: "shipstation",
    eventId: String(shipStationShipmentId ?? shipStationOrderId ?? "unknown"),
    eventType: "shipment_update",
    signature,
    payloadJson: body,
    status: "received",
    receivedAt: toTimestamp(),
  });

  if (!shipStationOrderId) {
    await db
      .update(webhooksLog)
      .set({ processedAt: toTimestamp(), status: "processed" })
      .where(eq(webhooksLog.id, webhookId));
    return NextResponse.json({ received: true });
  }

  const existingShipment = await db
    .select()
    .from(shipments)
    .where(eq(shipments.shipStationOrderId, String(shipStationOrderId)));

  if (existingShipment[0]) {
    await db
      .update(shipments)
      .set({
        status,
        trackingNumber: trackingNumber ?? existingShipment[0].trackingNumber,
        carrier: carrier ?? existingShipment[0].carrier,
        service: service ?? existingShipment[0].service,
        shipStationShipmentId: shipStationShipmentId ? String(shipStationShipmentId) : existingShipment[0].shipStationShipmentId,
        shippedAt: status === "shipped" ? toTimestamp() : existingShipment[0].shippedAt,
      })
      .where(eq(shipments.id, existingShipment[0].id));

    await db
      .update(orders)
      .set({
        fulfillmentStatus: status === "shipped" ? "shipped" : "in_progress",
        updatedAt: toTimestamp(),
      })
      .where(eq(orders.id, existingShipment[0].orderId));

    const [order] = await db.select().from(orders).where(eq(orders.id, existingShipment[0].orderId));
    if (order?.customerEmail && trackingNumber) {
      await sendShippingConfirmation({
        to: order.customerEmail,
        orderId: order.id,
        trackingNumber,
      });
    }
  }

  await db.update(webhooksLog).set({ processedAt: toTimestamp(), status: "processed" }).where(eq(webhooksLog.id, webhookId));
  return NextResponse.json({ received: true });
}
