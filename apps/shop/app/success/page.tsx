import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { setCart } from "@/lib/cart";

type SuccessPageProps = {
  searchParams?: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  setCart({ items: [] });
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
      <div className="rounded-2xl border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Thanks for your order</h1>
        <p className="mt-3 text-slate-600">
          We are preparing your Mezcalomano Discovery Deck. You will receive a confirmation email shortly.
        </p>
        {orderId ? (
          <a
            href={`/order/${orderId}`}
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View order status
          </a>
        ) : (
          <p className="mt-6 text-sm text-slate-500">Order details will appear once payment is confirmed.</p>
        )}
      </div>
    </section>
  );
}
