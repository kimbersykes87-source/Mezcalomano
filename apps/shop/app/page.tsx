import { addToCartAction } from "@/app/actions/cart";
import { getActiveProductWithPrice } from "@/lib/catalog";
import { formatCurrency } from "@/lib/money";
import Link from "next/link";

export default async function Home() {
  const product = await getActiveProductWithPrice("prod_discovery_deck");

  if (!product) {
    return (
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Product unavailable</h1>
        <p className="mt-2 text-slate-600">Please check back soon.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-start">
      <div className="aspect-[4/3] w-full rounded-2xl border border-slate-200 bg-slate-50" />
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Mezcalomano</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{product.name}</h1>
          <p className="mt-3 text-slate-600">
            {product.description ??
              "A curated 54-card deck celebrating mezcal culture, tasting notes, and cocktail inspiration."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{formatCurrency(product.unitAmount, product.currency)}</span>
            <span className="text-sm text-slate-500">USD</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Duties and taxes not included for international shipments. Customers may be charged on delivery.
          </p>
        </div>
        <form action={addToCartAction} className="flex flex-col gap-3">
          <input type="hidden" name="productId" value={product.productId} />
          <input type="hidden" name="priceId" value={product.priceId} />
          <button
            className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            type="submit"
          >
            Add to cart
          </button>
          <Link
            href="/cart"
            className="w-full rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            View cart
          </Link>
        </form>
        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">Free US shipping</p>
            <p className="mt-1">International flat rates at checkout.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">Ships from USA</p>
            <p className="mt-1">Fulfilled by our 3PL partner.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
