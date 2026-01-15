import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { orderItems, orders, shipments } from "@/db/schema";
import { formatCurrency } from "@/lib/money";

type OrderPageProps = {
  params: { orderId: string };
};

export default async function OrderPage({ params }: OrderPageProps) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, params.orderId));
  if (!order) {
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-slate-900">Order not found</h1>
        <p className="mt-2 text-slate-600">Check the link and try again.</p>
      </section>
    );
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const shipment = await db.select().from(shipments).where(eq(shipments.orderId, order.id));
  const activeShipment = shipment[0];

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Order {order.id}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Payment status: {order.paymentStatus} · Fulfillment status: {order.fulfillmentStatus}
        </p>
        <div className="mt-6 space-y-2 text-sm text-slate-600">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.totalAmount, order.currency)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount, order.currency)}</span>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Shipping</p>
          <p className="mt-1">
            Service: {order.shippingService ?? "Standard"} · Country: {order.shippingCountry ?? "—"}
          </p>
          {activeShipment?.trackingNumber ? (
            <p className="mt-2">
              Tracking: {activeShipment.trackingNumber}
              {activeShipment.labelUrl ? (
                <a className="ml-2 text-slate-900 underline" href={activeShipment.labelUrl}>
                  View label
                </a>
              ) : null}
            </p>
          ) : (
            <p className="mt-2 text-slate-500">Tracking will appear once shipped.</p>
          )}
        </div>
      </div>
    </section>
  );
}
