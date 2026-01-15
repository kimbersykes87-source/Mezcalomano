import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { bundleItems, bundles } from "@/db/schema";

export default async function AdminBundlesPage() {
  await requireAdmin();
  const db = getDb();
  const bundleRows = await db.select().from(bundles);
  const itemRows = await db.select().from(bundleItems);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Bundles</h1>
      <div className="mt-8 grid gap-6">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Existing bundles</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {bundleRows.length === 0 ? (
              <p>No bundles yet.</p>
            ) : (
              bundleRows.map((bundle) => (
                <div key={bundle.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{bundle.name}</span>
                    <span className="text-xs text-slate-500">{bundle.id}</span>
                  </div>
                  <ul className="mt-2 text-xs text-slate-500">
                    {itemRows
                      .filter((item) => item.bundleId === bundle.id)
                      .map((item) => (
                        <li key={item.id}>
                          {item.productId} × {item.quantity}
                        </li>
                      ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Create/update bundle</h2>
          <form action="/api/admin/bundles/upsert" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="bundleId" placeholder="Bundle ID (leave blank to create)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <input name="name" placeholder="Name" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="description" placeholder="Description" className="rounded-md border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
            <button className="md:col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Save bundle
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Add bundle item</h2>
          <form action="/api/admin/bundles/add-item" method="post" className="mt-4 flex flex-wrap gap-3">
            <input name="bundleId" placeholder="Bundle ID" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="productId" placeholder="Product ID" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="quantity" type="number" placeholder="Qty" defaultValue={1} className="w-24 rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Add item
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
