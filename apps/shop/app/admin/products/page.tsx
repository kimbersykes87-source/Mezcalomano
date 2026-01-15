import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { inventory, prices, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminProductsPage() {
  await requireAdmin();
  const db = getDb();
  const productRows = await db.select().from(products);
  const priceRows = await db.select().from(prices);
  const inventoryRows = await db.select().from(inventory);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Products & inventory</h1>
      <div className="mt-8 grid gap-6">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Existing products</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {productRows.map((product) => {
              const price = priceRows.find((row) => row.productId === product.id);
              const stock = inventoryRows.find((row) => row.productId === product.id);
              return (
                <div key={product.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{product.name}</span>
                    <span>{price ? `${price.currency} ${price.unitAmount / 100}` : "No price"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">SKU: {product.id}</p>
                  <p className="text-xs text-slate-500">
                    Inventory: {stock?.onHand ?? 0} on hand · {stock?.reserved ?? 0} reserved
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Upsert product</h2>
          <form action="/api/admin/products/upsert" method="post" className="mt-4 grid gap-4 md:grid-cols-2">
            <input name="productId" placeholder="Product ID (leave blank to create)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <input name="name" placeholder="Name" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="description" placeholder="Description" className="rounded-md border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
            <input name="hsCode" placeholder="HS code" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="originCountry" placeholder="Origin country (US)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="weightGrams" type="number" placeholder="Weight grams" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="widthIn" placeholder="Width (in)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="heightIn" placeholder="Height (in)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="depthIn" placeholder="Depth (in)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="priceId" placeholder="Price ID (leave blank to create)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <input name="currency" placeholder="Currency (USD)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="unitAmount" type="number" placeholder="Unit amount (cents)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <button className="md:col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Save product
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Update inventory</h2>
          <form action="/api/admin/inventory/update" method="post" className="mt-4 flex flex-wrap gap-3">
            <input name="productId" placeholder="Product ID" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="onHand" type="number" placeholder="On hand" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Update
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
