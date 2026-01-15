import { removeFromCartAction, updateQuantityAction, updateShippingAction } from "@/app/actions/cart";
import { getCart } from "@/lib/cart";
import { getProductsByIds } from "@/lib/catalog";
import { formatCurrency } from "@/lib/money";
import { getShippingRatesForCountry } from "@/lib/shipping";

export default async function CartPage() {
  const cart = await getCart();
  const products = await getProductsByIds(cart.items.map((item) => item.productId));
  const items = cart.items
    .map((item) => {
      const product = products.find((entry) => entry.productId === item.productId);
      if (!product) return null;
      return {
        ...item,
        name: product.name,
        unitAmount: product.unitAmount,
        currency: product.currency,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item!.unitAmount * item!.quantity, 0);
  const shippingRates = cart.shippingCountry ? await getShippingRatesForCountry(cart.shippingCountry) : [];
  const selectedRate =
    shippingRates.find((rate) => rate.serviceLevel === (cart.shippingService ?? "standard")) ?? shippingRates[0];
  const shippingAmount = selectedRate?.amount ?? 0;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <h1 className="text-2xl font-brand-bold" style={{ color: 'var(--foreground)' }}>Your cart</h1>
          {items.length === 0 ? (
            <p className="mt-4" style={{ color: 'var(--accent-muted)' }}>Your cart is empty.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item!.productId} className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <p className="font-brand-bold" style={{ color: 'var(--foreground)' }}>{item!.name}</p>
                    <p className="text-sm" style={{ color: 'var(--accent-muted)' }}>
                      {formatCurrency(item!.unitAmount, item!.currency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <form action={updateQuantityAction} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={item!.productId} />
                      <input
                        name="quantity"
                        type="number"
                        min={1}
                        defaultValue={item!.quantity}
                        className="w-16 rounded-md border px-2 py-1 text-sm"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                      <button className="text-sm font-brand transition-opacity hover:opacity-80" style={{ color: 'var(--accent-muted)' }} type="submit">
                        Update
                      </button>
                    </form>
                    <form action={removeFromCartAction}>
                      <input type="hidden" name="productId" value={item!.productId} />
                      <button className="text-sm transition-opacity hover:opacity-80" style={{ color: 'var(--accent-muted)' }} type="submit">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-brand uppercase" style={{ color: 'var(--accent-muted)' }}>Shipping</h2>
            <form action={updateShippingAction} className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-brand" style={{ color: 'var(--accent-muted)' }}>Country code</label>
                <input
                  name="shippingCountry"
                  placeholder="US"
                  defaultValue={cart.shippingCountry ?? ""}
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm uppercase"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="text-xs font-brand" style={{ color: 'var(--accent-muted)' }}>Service</label>
                <select
                  name="shippingService"
                  defaultValue={cart.shippingService ?? "standard"}
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                </select>
              </div>
              <button
                type="submit"
                className="md:col-span-2 rounded-md border px-3 py-2 text-sm font-brand transition-colors"
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
                Update shipping
              </button>
            </form>
            <p className="mt-4 text-xs" style={{ color: 'var(--accent-muted)' }}>
              Duties and taxes not included for international shipments. Customers may be charged on delivery.
            </p>
          </div>
        </div>
        <aside className="w-full max-w-sm rounded-2xl border p-6" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-brand-bold" style={{ color: 'var(--foreground)' }}>Order summary</h2>
          <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--accent-muted)' }}>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shippingAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3 font-brand-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--foreground)' }}>
              <span>Total (excl. tax)</span>
              <span>{formatCurrency(subtotal + shippingAmount)}</span>
            </div>
          </div>
          <form action="/api/checkout" method="post" className="mt-6">
            <button
              disabled
              className="w-full rounded-full px-6 py-3 text-sm font-brand text-white disabled:cursor-not-allowed opacity-50"
              style={{ backgroundColor: 'var(--accent-muted)' }}
              type="submit"
            >
              Checkout (coming soon)
            </button>
          </form>
          <div className="mt-6 text-xs" style={{ color: 'var(--accent-muted)' }}>
            Checkout, payments, and shipping integrations will be enabled once Stripe is configured.
          </div>
        </aside>
      </div>
    </section>
  );
}
