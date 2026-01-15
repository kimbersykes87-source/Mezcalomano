import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { formatCurrency } from "@/lib/money";
import Link from "next/link";

export default async function AdminDashboard() {
  await requireAdmin();
  const db = getDb();
  const orderRows = await db.select().from(orders).orderBy(orders.createdAt).limit(20);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
      <div className="mt-8 grid gap-6">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Catalog & shipping</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="rounded-md border border-slate-200 px-3 py-2 text-slate-700" href="/admin/products">
              Products & inventory
            </Link>
            <Link className="rounded-md border border-slate-200 px-3 py-2 text-slate-700" href="/admin/bundles">
              Bundles
            </Link>
            <Link className="rounded-md border border-slate-200 px-3 py-2 text-slate-700" href="/admin/shipping">
              Shipping zones & rates
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Orders</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {orderRows.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              orderRows.map((order) => (
                <div key={order.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{order.id}</span>
                    <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Payment: {order.paymentStatus} · Fulfillment: {order.fulfillmentStatus}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <form action="/api/admin/orders/resend-email" method="post">
                      <input type="hidden" name="orderId" value={order.id} />
                      <button className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        Resend email
                      </button>
                    </form>
                    <form action="/api/admin/orders/resync-shipstation" method="post">
                      <input type="hidden" name="orderId" value={order.id} />
                      <button className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        Resync ShipStation
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Operations</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action="/api/admin/sheets/sync" method="post">
              <button className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Sync Google Sheets
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Privacy tools</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <form action="/api/admin/customers/export" method="post" className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Export customer data</label>
              <input
                name="email"
                type="email"
                placeholder="customer@email.com"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                Export
              </button>
            </form>
            <form action="/api/admin/customers/delete" method="post" className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Delete/anonymize customer</label>
              <input
                name="email"
                type="email"
                placeholder="customer@email.com"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                Delete/anonymize
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Retention settings</h2>
          <form action="/api/admin/retention/update" method="post" className="mt-4 flex gap-3">
            <input
              name="days"
              type="number"
              min={30}
              defaultValue={365}
              className="w-32 rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Update retention
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
