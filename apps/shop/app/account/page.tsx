import { eq } from "drizzle-orm";

import { requireCustomer } from "@/lib/customer-auth";
import { getDb } from "@/db";
import { customers, orders } from "@/db/schema";
import { formatCurrency } from "@/lib/money";
import Link from "next/link";

export default async function AccountPage() {
  const session = await requireCustomer();
  const db = getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.email, session.email));
  const orderRows = customer
    ? await db.select().from(orders).where(eq(orders.customerId, customer.id))
    : [];

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Your account</h1>
      <div className="mt-6 grid gap-6">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Orders</h2>
          {orderRows.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No orders found.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {orderRows.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{order.id}</p>
                    <p className="text-xs text-slate-500">
                      {order.paymentStatus} · {order.fulfillmentStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(order.totalAmount, order.currency)}</p>
                    <Link className="text-xs text-slate-900 underline" href={`/order/${order.id}`}>
                      View status
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Marketing preferences</h2>
          <form action="/api/account/preferences" method="post" className="mt-4 flex items-center gap-3">
            <input type="hidden" name="email" value={customer?.email ?? session.email} />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" name="optIn" defaultChecked={customer?.marketingOptIn === 1} />
              Subscribe to marketing emails
            </label>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Update
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Data requests</h2>
          <form action="/api/account/delete-request" method="post" className="mt-4 space-y-3">
            <input type="hidden" name="email" value={customer?.email ?? session.email} />
            <p className="text-sm text-slate-600">
              Request deletion or anonymization of your data. We will follow up via email.
            </p>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Request deletion
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
