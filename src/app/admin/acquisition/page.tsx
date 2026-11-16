import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { fmtMoney, fmtNumber } from "@/lib/admin/summary";
import { liveCached, section } from "@/lib/sources/cache";
import { livePress, type PressRow } from "@/lib/sources/press";
import { PRESS_LINK_BASE } from "@/lib/press-links";
import RefreshButton from "./RefreshButton";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Acquisition / Press" };

const when = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
    : "never";
const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short" }).format(new Date(iso));

function Tile({ label, value, money }: { label: string; value: number; money?: boolean }) {
  return (
    <div className="adm-tile">
      <div className="adm-tile-label">{label}</div>
      <div className="adm-tile-value">{money ? fmtMoney(value) : fmtNumber(value)}</div>
      <div className="adm-tile-change">&nbsp;</div>
    </div>
  );
}

function Outlet({ r }: { r: PressRow }) {
  return (
    <>
      <strong>{r.outlet || r.name || r.slug}</strong>
      {r.name && r.outlet && r.name !== r.outlet ? <span className="adm-sub"> {r.name}</span> : null}
      <div className="adm-sub">
        <span title="Not a link here, so checking it does not count as a click">{PRESS_LINK_BASE.replace("https://", "")}{r.slug}</span>
        {r.promoId ? ` · ${r.promoId}` : ""} · made {day(r.createdAt)}
      </div>
    </>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ fresh?: string }> }) {
  await requireAdmin("/acquisition");
  const sp = await searchParams;
  const live = await liveCached("press-links", Boolean(sp.fresh), () => section(livePress));
  const res = live.data;

  return (
    <div className="adm-wrap">
      <div className="adm-top">
        <div>
          <h1 className="adm-live-title">Acquisition / Press</h1>
          <p className="adm-sub">
            Tracked links for press and creators (mezcalomano.com/r/…). Links are made from the launch tracker sheet:
            Promo list, menu Tracked links. Clicks are counted here; orders are matched in Shopify from the link&apos;s UTMs.
          </p>
        </div>
        <RefreshButton />
      </div>

      {!res.ok && (
        <div className="adm-fail">
          <strong>Press links could not load.</strong> {res.error}
        </div>
      )}

      {res.ok && (() => {
        const { rows, orders } = res.data;
        const sum = (f: (r: PressRow) => number) => rows.reduce((a, r) => a + f(r), 0);
        return (
          <>
            <section className="adm-grid" aria-label="Press links">
              <Tile label="Links made" value={rows.length} />
              <Tile label="Outlets with a click" value={rows.filter((r) => r.clicks > 0).length} />
              <Tile label="Clicks, all time" value={sum((r) => r.clicks)} />
              <Tile label="Clicks, last 7 days" value={sum((r) => r.clicks7)} />
              <Tile label="Orders from press links" value={sum((r) => r.orders)} />
              <Tile label="Net sales from press links" value={sum((r) => r.netSales)} money />
            </section>

            {!orders.ok && (
              <div className="adm-fail">
                <strong>Orders could not be matched.</strong> {orders.error} Clicks below are still correct.
              </div>
            )}

            <section className="adm-section">
              <h2>By outlet</h2>
              {!rows.length ? (
                <p className="adm-empty">
                  No links yet. In the launch tracker, open the Promo list tab and choose Tracked links, then Make links for new Said yes.
                </p>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Outlet</th>
                      <th className="num">Clicks</th>
                      <th className="num">Last 7 days</th>
                      <th className="num">Last click</th>
                      <th className="num">Orders</th>
                      <th className="num">Net sales</th>
                      <th className="num">Scanner hits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.slug}>
                        <td className="name"><Outlet r={r} /></td>
                        <td className="num">{fmtNumber(r.clicks)}</td>
                        <td className="num">{fmtNumber(r.clicks7)}</td>
                        <td className="num">{when(r.lastClick)}</td>
                        <td className="num">{fmtNumber(r.orders)}</td>
                        <td className="num">{fmtMoney(r.netSales)}</td>
                        <td className="num">{fmtNumber(r.bots)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="adm-sub" style={{ marginTop: 10 }}>
                Clicks leave out link previews, crawlers and mail link scanners (shown as scanner hits). Orders count when the
                buyer&apos;s first or last shop visit came through that outlet&apos;s link; test and cancelled orders are left out.
                {orders.ok && rows.length ? ` ${fmtNumber(orders.data.checked)} orders checked since the first link was made.` : ""}
              </p>
            </section>
          </>
        );
      })()}
    </div>
  );
}
