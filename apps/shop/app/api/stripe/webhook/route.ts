import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import {
  addresses,
  customers,
  orderItems,
  orders,
  payments,
  products,
  shipments,
  webhooksLog,
} from "@/db/schema";
import { createId } from "@/lib/ids";
import { commitInventory, releaseInventory } from "@/lib/inventory";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { createShipStationOrder } from "@/lib/shipstation";
import { sendOrderConfirmation, sendRefundConfirmation } from "@/lib/email";
import { getRequestContext } from "@cloudflare/next-on-pages";
import "@/lib/cloudflare-env";

const toTimestamp = () => Date.now();

type SessionWithShippingDetails = Stripe.Checkout.Session & {
  shipping_details?: { name?: string | null; address?: Stripe.Address | null } | null;
};

const upsertCustomer = async (db: ReturnType<typeof getDb>, session: Stripe.Checkout.Session) => {
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  if (!email) {
    return null;
  }
  const existing = await db.select().from(customers).where(eq(customers.email, email));
  if (existing[0]) {
    return existing[0];
  }
  const customerId = createId("cus");
  await db.insert(customers).values({
    id: customerId,
    name: session.customer_details?.name ?? "Guest",
    email,
    phone: session.customer_details?.phone ?? "",
    marketingOptIn: 0,
    createdAt: toTimestamp(),
    updatedAt: toTimestamp(),
  });
  return { id: customerId, email };
};

const insertAddresses = async (
  db: ReturnType<typeof getDb>,
  orderId: string,
  customerId: string | null,
  session: Stripe.Checkout.Session,
) => {
  const shipping = (session as SessionWithShippingDetails).shipping_details;
  const billing = session.customer_details;

  if (shipping?.address) {
    await db.insert(addresses).values({
      id: createId("addr"),
      customerId,
      orderId,
      type: "shipping",
      name: shipping.name ?? billing?.name ?? "Customer",
      line1: shipping.address.line1 ?? "",
      line2: shipping.address.line2 ?? null,
      city: shipping.address.city ?? "",
      state: shipping.address.state ?? null,
      postalCode: shipping.address.postal_code ?? "",
      country: shipping.address.country ?? "",
      phone: billing?.phone ?? null,
      createdAt: toTimestamp(),
    });
  }

  if (billing?.address) {
    await db.insert(addresses).values({
      id: createId("addr"),
      customerId,
      orderId,
      type: "billing",
      name: billing.name ?? "Customer",
      line1: billing.address.line1 ?? "",
      line2: billing.address.line2 ?? null,
      city: billing.address.city ?? "",
      state: billing.address.state ?? null,
      postalCode: billing.address.postal_code ?? "",
      country: billing.address.country ?? "",
      phone: billing.phone ?? null,
      createdAt: toTimestamp(),
    });
  }
};

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const db = getDb();
  const { env: cfEnv } = getRequestContext();
  const reservationId = session.metadata?.reservation_id;
  const reservationRaw = reservationId ? await cfEnv.KV.get(`reservation:${reservationId}`) : null;
  const reservation = reservationRaw ? JSON.parse(reservationRaw) : null;
  const shipping = (session as SessionWithShippingDetails).shipping_details;

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const customerRecord = await upsertCustomer(db, session);
  const orderId = createId("ord");

  await db.insert(orders).values({
    id: orderId,
    customerId: customerRecord?.id ?? null,
    status: "confirmed",
    paymentStatus: "paid",
    fulfillmentStatus: "pending",
    customerEmail: customerRecord?.email ?? session.customer_details?.email ?? null,
    shippingCountry: shipping?.address?.country ?? null,
    shippingService: session.metadata?.shipping_service ?? null,
    currency: (session.currency ?? "usd").toUpperCase(),
    subtotalAmount: session.amount_subtotal ?? 0,
    taxAmount: session.total_details?.amount_tax ?? 0,
    shippingAmount: session.shipping_cost?.amount_total ?? 0,
    totalAmount: session.amount_total ?? 0,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    stripeChargeId: typeof session.payment_intent === "string" ? null : null,
    taxCalculationJson: JSON.stringify({
      total_details: session.total_details ?? null,
      automatic_tax: session.automatic_tax ?? null,
    }),
    dutiesNoticeShown: 1,
    createdAt: toTimestamp(),
    updatedAt: toTimestamp(),
  });

  const lineItemProducts: Array<{
    lineItem: Stripe.LineItem;
    productId: string | null;
    productName: string;
  }> = [];

  for (const item of lineItems.data) {
    const price = item.price;
    const product = price?.product as Stripe.Product | null;
    const productId = product?.metadata?.product_id ?? null;
    const productName = item.description ?? product?.name ?? "Item";
    await db.insert(orderItems).values({
      id: createId("itm"),
      orderId,
      productId,
      priceId: price?.id ?? null,
      name: productName,
      quantity: item.quantity ?? 1,
      unitAmount: price?.unit_amount ?? 0,
      taxAmount: 0,
      totalAmount: item.amount_total ?? 0,
    });
    lineItemProducts.push({ lineItem: item, productId, productName });
  }

  await db.insert(payments).values({
    id: createId("pay"),
    orderId,
    provider: "stripe",
    status: "paid",
    amount: session.amount_total ?? 0,
    currency: (session.currency ?? "usd").toUpperCase(),
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    stripeChargeId: null,
    createdAt: toTimestamp(),
  });

  await insertAddresses(db, orderId, customerRecord?.id ?? null, session);

  if (reservation?.items?.length) {
    await commitInventory(reservation.items);
    await cfEnv.KV.delete(`reservation:${reservationId}`);
  }

  const shippingAddress = shipping?.address;
  const billingAddress = session.customer_details?.address;
  const shipTo = {
    name: shipping?.name ?? session.customer_details?.name ?? "Customer",
    street1: shippingAddress?.line1 ?? "",
    street2: shippingAddress?.line2 ?? null,
    city: shippingAddress?.city ?? "",
    state: shippingAddress?.state ?? null,
    postalCode: shippingAddress?.postal_code ?? "",
    country: shippingAddress?.country ?? "",
    phone: session.customer_details?.phone ?? null,
  };
  const billTo = {
    name: session.customer_details?.name ?? "Customer",
    street1: billingAddress?.line1 ?? "",
    street2: billingAddress?.line2 ?? null,
    city: billingAddress?.city ?? "",
    state: billingAddress?.state ?? null,
    postalCode: billingAddress?.postal_code ?? "",
    country: billingAddress?.country ?? "",
    phone: session.customer_details?.phone ?? null,
  };

  const productIds = lineItemProducts.map((item) => item.productId).filter(Boolean) as string[];
  const productRows = productIds.length
    ? await db.select().from(products).where(inArray(products.id, productIds))
    : [];

  const itemsForShipStation = lineItemProducts.map((entry) => {
    const product = productRows.find((row) => row.id === entry.productId);
    const unitAmount = entry.lineItem.price?.unit_amount ?? 0;
    return {
      lineItemKey: entry.lineItem.id ?? createId("item"),
      sku: entry.productId ?? "unknown",
      name: entry.productName,
      quantity: entry.lineItem.quantity ?? 1,
      unitPrice: unitAmount / 100,
      weight: { value: product?.weightGrams ?? 150, units: "grams" as const },
      productId: entry.productId,
      hsCode: product?.hsCode ?? "9504400000",
      originCountry: product?.originCountry ?? "US",
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
          harmonizedTariffCode: item.hsCode ?? "9504400000",
          countryOfOrigin: item.originCountry ?? "US",
        })),
      }
    : undefined;

  const shipStation = await createShipStationOrder({
    orderNumber: orderId,
    orderKey: orderId,
    orderDate: new Date().toISOString(),
    orderStatus: "awaiting_shipment",
    customerEmail: customerRecord?.email ?? session.customer_details?.email ?? "unknown@example.com",
    billTo,
    shipTo,
    items: itemsForShipStation,
    amountPaid: (session.amount_total ?? 0) / 100,
    taxAmount: (session.total_details?.amount_tax ?? 0) / 100,
    shippingAmount: (session.shipping_cost?.amount_total ?? 0) / 100,
    requestedShippingService: session.metadata?.shipping_service ?? null,
    advancedOptions: { storeId: Number(env.SHIPSTATION_STORE_ID) },
    internationalOptions,
  });

  await db.insert(shipments).values({
    id: createId("shp"),
    orderId,
    status: "created",
    shipStationOrderId: String(shipStation.orderId),
    createdAt: toTimestamp(),
  });

  if (customerRecord?.email ?? session.customer_details?.email) {
    await sendOrderConfirmation({
      to: customerRecord?.email ?? session.customer_details?.email ?? "",
      orderId,
      totalAmount: session.amount_total ?? 0,
      currency: (session.currency ?? "usd").toUpperCase(),
    });
  }

  return orderId;
};

const handleCheckoutExpired = async (session: Stripe.Checkout.Session) => {
  const { env: cfEnv } = getRequestContext();
  const reservationId = session.metadata?.reservation_id;
  if (!reservationId) return;
  const reservationRaw = await cfEnv.KV.get(`reservation:${reservationId}`);
  if (!reservationRaw) return;
  const reservation = JSON.parse(reservationRaw);
  if (reservation?.items?.length) {
    await releaseInventory(reservation.items);
  }
  await cfEnv.KV.delete(`reservation:${reservationId}`);
};

const handleChargeRefunded = async (charge: Stripe.Charge) => {
  const db = getDb();
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) return;
  const affected = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId));
  await db
    .update(orders)
    .set({ status: "refunded", paymentStatus: "refunded", updatedAt: toTimestamp() })
    .where(eq(orders.stripePaymentIntentId, paymentIntentId));
  await db
    .update(payments)
    .set({ status: "refunded" })
    .where(eq(payments.stripePaymentIntentId, paymentIntentId));

  if (affected[0]?.customerEmail) {
    await sendRefundConfirmation({ to: affected[0].customerEmail, orderId: affected[0].id });
  }
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature") ?? "";
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const db = getDb();
  const existing = await db.select().from(webhooksLog).where(eq(webhooksLog.eventId, event.id));
  if (existing.length > 0) {
    return NextResponse.json({ received: true });
  }

  await db.insert(webhooksLog).values({
    id: createId("wh"),
    provider: "stripe",
    eventId: event.id,
    eventType: event.type,
    signature,
    payloadJson: body,
    status: "received",
    receivedAt: toTimestamp(),
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        break;
    }

    await db
      .update(webhooksLog)
      .set({ processedAt: toTimestamp(), status: "processed" })
      .where(eq(webhooksLog.eventId, event.id));

    return NextResponse.json({ received: true });
  } catch (error) {
    await db
      .update(webhooksLog)
      .set({ processedAt: toTimestamp(), status: "failed", errorMessage: String(error) })
      .where(eq(webhooksLog.eventId, event.id));
    throw error;
  }
}
