import { removeFromCartAction, updateQuantityAction, updateShippingAction } from "@/app/actions/cart";
import { getCart } from "@/lib/cart";
import { getProductsByIds } from "@/lib/catalog";
import { formatCurrency } from "@/lib/money";
import { getShippingRatesForCountry } from "@/lib/shipping";

export default async function CartPage() {
  const cart = getCart();
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
          <h1 className="text-2xl font-semibold text-slate-900">Your cart</h1>
          {items.length === 0 ? (
            <p className="mt-4 text-slate-600">Your cart is empty.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item!.productId} className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item!.name}</p>
                    <p className="text-sm text-slate-500">
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
                        className="w-16 rounded-md border border-slate-200 px-2 py-1 text-sm"
                      />
                      <button className="text-sm font-semibold text-slate-700 hover:text-slate-900" type="submit">
                        Update
                      </button>
                    </form>
                    <form action={removeFromCartAction}>
                      <input type="hidden" name="productId" value={item!.productId} />
                      <button className="text-sm text-slate-500 hover:text-slate-700" type="submit">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold uppercase text-slate-700">Shipping</h2>
            <form action={updateShippingAction} className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">Country code</label>
                <input
                  name="shippingCountry"
                  placeholder="US"
                  defaultValue={cart.shippingCountry ?? ""}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Service</label>
                <select
                  name="shippingService"
                  defaultValue={cart.shippingService ?? "standard"}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                </select>
              </div>
              <button
                type="submit"
                className="md:col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                Update shipping
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              Duties and taxes not included for international shipments. Customers may be charged on delivery.
            </p>
          </div>
        </div>
        <aside className="w-full max-w-sm rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shippingAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
              <span>Total (excl. tax)</span>
              <span>{formatCurrency(subtotal + shippingAmount)}</span>
            </div>
          </div>
          <form action="/api/checkout" method="post" className="mt-6">
            <button
              disabled={items.length === 0}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              type="submit"
            >
              Checkout
            </button>
          </form>
          <div className="mt-6 text-xs text-slate-500">
            Taxes are calculated at checkout. Stripe Tax will collect the required billing details.
          </div>
        </aside>
      </div>
    </section>
  );
}
