export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-slate-600">
        <p>
          Mezcalomano collects data necessary to fulfill orders, provide support, and comply with legal obligations.
        </p>
        <p>
          We store customer contact, shipping, billing, and order history. Optional fields are collected only when
          provided.
        </p>
        <p>
          We use Stripe for payments and ShipStation for fulfillment. We do not store card data. Marketing opt-in is
          optional and unchecked by default.
        </p>
        <p>
          You can request data export or deletion at any time by contacting support or using the account portal.
        </p>
      </div>
    </section>
  );
}
