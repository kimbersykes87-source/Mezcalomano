import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { orderItems, orders, shipments } from "@/db/schema";
import { formatCurrency } from "@/lib/money";

type OrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-brand-bold" style={{ color: 'var(--foreground)' }}>Order not found</h1>
        <p className="mt-2" style={{ color: 'var(--accent-muted)' }}>Check the link and try again.</p>
      </section>
    );
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const shipment = await db.select().from(shipments).where(eq(shipments.orderId, order.id));
  const activeShipment = shipment[0];

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-2xl font-brand-bold" style={{ color: 'var(--foreground)' }}>Order {order.id}</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--accent-muted)' }}>
          Payment status: {order.paymentStatus} · Fulfillment status: {order.fulfillmentStatus}
        </p>
        <div className="mt-6 space-y-2 text-sm" style={{ color: 'var(--accent-muted)' }}>
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.totalAmount, order.currency)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3 font-brand-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--foreground)' }}>
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount, order.currency)}</span>
          </div>
        </div>
        <div className="mt-6 rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--accent-muted)' }}>
          <p className="font-brand-bold" style={{ color: 'var(--foreground)' }}>Shipping</p>
          <p className="mt-1">
            Service: {order.shippingService ?? "Standard"} · Country: {order.shippingCountry ?? "—"}
          </p>
          {activeShipment?.trackingNumber ? (
            <p className="mt-2">
              Tracking: {activeShipment.trackingNumber}
              {activeShipment.labelUrl ? (
                <a className="ml-2 underline transition-opacity hover:opacity-80" style={{ color: 'var(--foreground)' }} href={activeShipment.labelUrl}>
                  View label
                </a>
              ) : null}
            </p>
          ) : (
            <p className="mt-2 opacity-70">Tracking will appear once shipped.</p>
          )}
        </div>
      </div>
    </section>
  );
}
