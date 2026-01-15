import { addToCartAction } from "@/app/actions/cart";
import { getActiveProductWithPrice } from "@/lib/catalog";
import { formatCurrency } from "@/lib/money";
import Link from "next/link";

export default async function Home() {
  const product = await getActiveProductWithPrice("prod_discovery_deck");

  if (!product) {
    return (
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-brand-bold" style={{ color: 'var(--foreground)' }}>Product unavailable</h1>
        <p className="mt-2" style={{ color: 'var(--accent-muted)' }}>Please check back soon.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-start">
      <div className="aspect-[4/3] w-full rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--border-color)' }} />
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <p className="text-sm font-brand tracking-[0.3em]" style={{ color: 'var(--accent-muted)' }}>Mezcalómano</p>
          <h1 className="mt-3 text-3xl font-brand-bold tracking-tight" style={{ color: 'var(--foreground)' }}>{product.name}</h1>
          <p className="mt-3" style={{ color: 'var(--accent-muted)' }}>
            {product.description ??
              "A curated 54-card deck celebrating mezcal culture, tasting notes, and cocktail inspiration."}
          </p>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-brand-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(product.unitAmount, product.currency)}</span>
            <span className="text-sm" style={{ color: 'var(--accent-muted)' }}>USD</span>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--accent-muted)' }}>
            Duties and taxes not included for international shipments. Customers may be charged on delivery.
          </p>
        </div>
        <form action={addToCartAction} className="flex flex-col gap-3">
          <input type="hidden" name="productId" value={product.productId} />
          <input type="hidden" name="priceId" value={product.priceId} />
          <button
            className="w-full rounded-full px-6 py-3 text-sm font-brand text-white transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            type="submit"
          >
            Add to cart
          </button>
          <Link
            href="/cart"
            className="w-full rounded-full border px-6 py-3 text-center text-sm font-brand transition-colors"
            style={{ 
              borderColor: 'var(--accent-muted)',
              color: 'var(--accent-muted)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-muted)';
              e.currentTarget.style.color = 'var(--primary-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--accent-muted)';
            }}
          >
            View cart
          </Link>
        </form>
        <div className="grid gap-4 text-sm sm:grid-cols-2" style={{ color: 'var(--accent-muted)' }}>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="font-brand-bold" style={{ color: 'var(--foreground)' }}>Free US shipping</p>
            <p className="mt-1">International flat rates at checkout.</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="font-brand-bold" style={{ color: 'var(--foreground)' }}>Ships from USA</p>
            <p className="mt-1">Fulfilled by our 3PL partner.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
