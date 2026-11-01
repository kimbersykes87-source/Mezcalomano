import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { fmtMoney, fmtNumber, pctChange } from "@/lib/admin/summary";
import { periodKey as readPeriod, periodRange } from "@/lib/admin/period";
import { liveCached } from "@/lib/sources/cache";
import { liveShop, liveOrders, previousRange, type ShopOrders, type ShopSessions } from "@/lib/sources/shop";
import LiveBar from "../LiveBar";
import LineChart from "../LineChart";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Shop" };

function Tile({ label, value, before, money }: { label: string; value: number | null; before?: number | null; money?: boolean }) {
  const change = before === undefined ? null : pctChange(value, before);
  const cls = change && (change.startsWith("+") || change === "new") ? "adm-up" : change && change.startsWith("-") ? "adm-down" : "";
  return (
    <div className="adm-tile">
      <div className="adm-tile-label">{label}</div>
      <div className="adm-tile-value">{money ? fmtMoney(value) : fmtNumber(value)}</div>
      <div className="adm-tile-change">{change ? <><span className={cls}>{change}</span> vs previous</> : <>&nbsp;</>}</div>
    </div>
  );
}

function Table({ head, rows, empty }: { head: string[]; rows: (string | number)[][]; empty: string }) {
  if (!rows.length) return <p className="adm-empty">{empty}</p>;
  return (
    <table className="adm-table">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={h} className={i ? "num" : undefined}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={String(r[0])}>
            {r.map((c, i) => (
              <td key={i} className={i ? "num" : "name"}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Funnel({ s }: { s: ShopSessions }) {
  const steps = [
    { label: "Sessions", value: s.sessions },
    { label: "Added to cart", value: s.cart },
    { label: "Reached checkout", value: s.checkout },
    { label: "Completed checkout", value: s.completed },
  ];
  if (!s.sessions) return <p className="adm-empty">No shop sessions in this period yet.</p>;
  return (
    <div>
      {steps.map((st) => {
        const share = st.value / s.sessions;
        return (
          <div className="adm-funnel-row" key={st.label}>
            <span>{st.label}</span>
            <div className="adm-funnel-bar" style={{ width: `${Math.max(share * 100, 0.5)}%` }} />
            <span className="num" style={{ textAlign: "right" }}>
              {fmtNumber(st.value)} <span className="adm-sub">{Math.round(share * 100)}%</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Failed({ what, error }: { what: string; error: string }) {
  return (
    <div className="adm-fail">
      <strong>{what} could not load.</strong> {error}
      <div className="adm-sub">Use Refresh now to try again. Nothing here is guessed or filled in from old data.</div>
    </div>
  );
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ p?: string; fresh?: string }> }) {
  await requireAdmin("/shop");
  const sp = await searchParams;
  const key = readPeriod(sp.p);
  const fresh = Boolean(sp.fresh);
  const { from, to } = periodRange(key);
  const prev = previousRange(from, to);

  const [live, before] = await Promise.all([
    liveCached(`shop:${from}:${to}`, fresh, () => liveShop(from, to)),
    liveCached(`shop-prev:${prev.from}:${prev.to}`, fresh, () => liveOrders(prev.from, prev.to).then((o): ShopOrders | null => o).catch(() => null)),
  ]);
  const { orders, sessions } = live.data;
  const o = orders.ok ? orders.data : null;
  const s = sessions.ok ? sessions.data : null;
  const p = before.data;
  const excludedTotal = o ? o.excluded.test + o.excluded.cancelled + o.excluded.testCode : 0;
  const conversion = s && s.sessions ? (s.completed / s.sessions) * 100 : null;

  return (
    <div className="adm-wrap">
      <LiveBar
        title="Shop"
        intro="Sessions, funnel, orders, sales, products, discount codes and where buyers came from. Orders and sales come from Shopify orders; sessions and referrers from Shopify reports."
        path="/admin/shop"
        periodKey={key}
        from={from}
        to={to}
        asOf={live.asOf}
        ok={orders.ok && sessions.ok}
      />

      {o && excludedTotal > 0 && (
        <p className="adm-note">
          Left out of the sales figures: {o.excluded.test} test order{o.excluded.test === 1 ? "" : "s"}, {o.excluded.testCode} order
          {o.excluded.testCode === 1 ? "" : "s"} using a test discount code and {o.excluded.cancelled} cancelled order
          {o.excluded.cancelled === 1 ? "" : "s"}.
        </p>
      )}

      {!orders.ok && <Failed what="Orders and sales" error={orders.error} />}
      {o && (
        <section className="adm-grid" aria-label="Sales">
          <Tile label="Orders" value={o.orders} before={p?.orders} />
          <Tile label="Net sales" value={o.netSales} before={p?.netSales} money />
          <Tile label="Total sales (with shipping and tax)" value={o.totalSales} before={p?.totalSales} money />
          <Tile label="Average order value" value={o.aov} before={p?.aov} money />
          <Tile label="Units sold" value={o.units} before={p?.units} />
          <Tile label="Discounts given" value={o.discounts} before={p?.discounts} money />
        </section>
      )}

      {s ? (
        <section className="adm-grid" aria-label="Shop traffic">
          <Tile label="Shop sessions" value={s.sessions} />
          <Tile label="Shop visitors" value={s.visitors} />
          <div className="adm-tile">
            <div className="adm-tile-label">Session to order rate</div>
            <div className="adm-tile-value">{conversion === null ? "no data" : `${conversion.toFixed(1)}%`}</div>
            <div className="adm-tile-change">Completed checkouts per session</div>
          </div>
        </section>
      ) : (
        !sessions.ok && <Failed what="Shop sessions" error={sessions.error} />
      )}

      {(o || s) && (
        <div className="adm-cols">
          {o && (
            <section className="adm-section">
              <h2>Orders and net sales per day</h2>
              <LineChart
                label="Net sales per day"
                series={[{ name: "Net sales", color: "#dfb725", points: o.daily.map((d) => ({ day: d.day, value: d.netSales })) }]}
              />
              <LineChart
                label="Orders per day"
                series={[{ name: "Orders", color: "#8fbf6a", points: o.daily.map((d) => ({ day: d.day, value: d.orders })) }]}
              />
            </section>
          )}
          {s && (
            <section className="adm-section">
              <h2>Shop sessions per day</h2>
              <LineChart
                label="Shop sessions per day"
                series={[{ name: "Sessions", color: "#dfb725", points: s.daily.map((d) => ({ day: d.day, value: d.sessions })) }]}
              />
            </section>
          )}
        </div>
      )}

      {s && (
        <section className="adm-section">
          <h2>Funnel</h2>
          <Funnel s={s} />
        </section>
      )}

      <div className="adm-cols">
        {o && (
          <section className="adm-section">
            <h2>Products</h2>
            <Table
              head={["Product", "Orders", "Units", "Line sales"]}
              rows={o.products.map((x) => [x.sku ? `${x.name} (${x.sku})` : x.name, x.orders, x.units, fmtMoney(x.lineSales)])}
              empty="No orders in this period yet."
            />
          </section>
        )}
        {o && (
          <section className="adm-section">
            <h2>Discount codes</h2>
            <Table
              head={["Code", "Orders", "Discount given"]}
              rows={o.codes.map((x) => [x.code, x.orders, fmtMoney(x.discount)])}
              empty="No discount codes used in this period."
            />
          </section>
        )}
        {s && (
          <section className="adm-section">
            <h2>Where shop visitors came from</h2>
            <Table
              head={["Source", "Sessions"]}
              rows={s.referrers.slice(0, 15).map((x) => [x.name, x.sessions])}
              empty="No sessions in this period yet."
            />
          </section>
        )}
        {o && (
          <section className="adm-section">
            <h2>Orders by country</h2>
            <Table head={["Country", "Orders"]} rows={o.countries.map((x) => [x.name, x.orders])} empty="No orders in this period yet." />
          </section>
        )}
        {s && (
          <section className="adm-section">
            <h2>Devices</h2>
            <Table head={["Device", "Sessions"]} rows={s.devices.map((x) => [x.name, x.sessions])} empty="No sessions in this period yet." />
          </section>
        )}
      </div>

      <p className="adm-sub">
        How this is counted: sales are Shopify orders created in the period (London days), not counting test, cancelled or test code orders.
        Net sales are items after discounts minus refunds. Sessions are Shopify&apos;s own count and can differ from website visits on the Overview.
        Changes compare with the previous period of the same length.
      </p>
    </div>
  );
}
