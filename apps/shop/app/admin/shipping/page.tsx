import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { shippingRates, shippingZones } from "@/db/schema";

export default async function AdminShippingPage() {
  await requireAdmin();
  const db = getDb();
  const zones = await db.select().from(shippingZones);
  const rates = await db.select().from(shippingRates);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Shipping zones & rates</h1>
      <div className="mt-8 grid gap-6">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Zones</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {zones.map((zone) => (
              <div key={zone.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{zone.name}</span>
                  <span className="text-xs text-slate-500">{zone.id}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Countries: {zone.countriesCsv}</p>
              </div>
            ))}
          </div>
          <form action="/api/admin/shipping/zones/upsert" method="post" className="mt-6 grid gap-3 md:grid-cols-2">
            <input name="zoneId" placeholder="Zone ID (leave blank to create)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <input name="name" placeholder="Name" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="countriesCsv" placeholder="Countries CSV or *" className="rounded-md border border-slate-200 px-3 py-2 text-sm md:col-span-2" required />
            <button className="md:col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Save zone
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">Rates</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {rates.map((rate) => (
              <div key={rate.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{rate.serviceLevel}</span>
                  <span className="text-xs text-slate-500">{rate.id}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Zone: {rate.zoneId} · {rate.currency} {rate.amount / 100}
                </p>
              </div>
            ))}
          </div>
          <form action="/api/admin/shipping/rates/upsert" method="post" className="mt-6 grid gap-3 md:grid-cols-2">
            <input name="rateId" placeholder="Rate ID (leave blank to create)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <input name="zoneId" placeholder="Zone ID" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="serviceLevel" placeholder="Service level (standard/express)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="currency" placeholder="Currency" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="amount" type="number" placeholder="Amount (cents)" className="rounded-md border border-slate-200 px-3 py-2 text-sm" required />
            <input name="minDays" type="number" placeholder="Min days" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <input name="maxDays" type="number" placeholder="Max days" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            <button className="md:col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Save rate
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
