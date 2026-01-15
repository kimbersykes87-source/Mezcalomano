import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { setCart } from "@/lib/cart";

type SuccessPageProps = {
  searchParams?: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  await setCart({ items: [] });
  const params = await searchParams;
  const sessionId = params?.session_id;
  let orderId: string | null = null;

  if (sessionId) {
    const db = getDb();
    const order = await db.select().from(orders).where(eq(orders.stripeCheckoutSessionId, sessionId));
    orderId = order[0]?.id ?? null;
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-2xl font-brand-bold" style={{ color: 'var(--foreground)' }}>Thanks for your order</h1>
        <p className="mt-3" style={{ color: 'var(--accent-muted)' }}>
          We are preparing your Mezcalómano Discovery Deck. You will receive a confirmation email shortly.
        </p>
        {orderId ? (
          <a
            href={`/order/${orderId}`}
            className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-brand text-white transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
          >
            View order status
          </a>
        ) : (
          <p className="mt-6 text-sm" style={{ color: 'var(--accent-muted)' }}>Order details will appear once payment is confirmed.</p>
        )}
      </div>
    </section>
  );
}
