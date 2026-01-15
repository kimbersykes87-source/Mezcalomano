export default function ShippingPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Shipping Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-slate-600">
        <p>USA: free shipping on all orders.</p>
        <p>International: flat rates for Standard and Express shipping are shown at checkout.</p>
        <p>We do not restrict PO boxes or regions; if a carrier is unavailable we select the next best option.</p>
        <p className="font-semibold text-slate-900">
          Duties and taxes are not included. Customers may be charged on delivery.
        </p>
      </div>
    </section>
  );
}
