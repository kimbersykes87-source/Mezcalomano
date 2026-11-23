import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { fmtNumber } from "@/lib/admin/summary";
import { liveCached, section } from "@/lib/sources/cache";
import { liveQr, QR_COUNT_FROM } from "@/lib/sources/qr";
import RefreshButton from "./RefreshButton";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Box QR" };

const when = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
    : "never";
const dayLabel = (day: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(new Date(`${day}T12:00:00Z`));
const countryName = (code: string) => {
  if (code.length !== 2) return code;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="adm-tile">
      <div className="adm-tile-label">{label}</div>
      <div className="adm-tile-value">{fmtNumber(value)}</div>
      <div className="adm-tile-change">&nbsp;</div>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ fresh?: string }> }) {
  await requireAdmin("/qr");
  const sp = await searchParams;
  const live = await liveCached("qr-scans", Boolean(sp.fresh), () => section(liveQr));
  const res = live.data;

  return (
    <div className="adm-wrap">
      <div className="adm-top">
        <div>
          <h1 className="adm-live-title">Box QR</h1>
          <p className="adm-sub">
            Scans of the QR on the Discovery Deck box, which opens mezcalomano.com/directory. Counted since {dayLabel(QR_COUNT_FROM)};
            nothing earlier exists.
          </p>
        </div>
        <RefreshButton />
      </div>

      {!res.ok && (
        <div className="adm-fail">
          <strong>Box QR scans could not load.</strong> {res.error}
        </div>
      )}

      {res.ok && (() => {
        const d = res.data;
        return (
          <>
            <section className="adm-grid" aria-label="Box QR scans">
              <Tile label="Scans, all time" value={d.total} />
              <Tile label="Scans, last 7 days" value={d.last7} />
              <Tile label="Scans, today" value={d.today} />
              <Tile label="On a phone" value={d.mobile} />
              <Tile label="On a computer" value={d.desktop} />
            </section>

            <p className="adm-note">
              The QR is a plain address, so a scan is a visit that starts on the directory page with no referrer: once per
              browser session, crawlers and our own browsers left out. Someone typing the address or opening a bookmark
              counts too, so read this as an upper estimate. Scans on a computer are almost always one of those. Last scan: {when(d.lastScan)}.
            </p>

            <section className="adm-section">
              <h2>By day</h2>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Day (London)</th>
                    <th className="num">Scans</th>
                  </tr>
                </thead>
                <tbody>
                  {d.days.map((r) => (
                    <tr key={r.day}>
                      <td className="name">{dayLabel(r.day)}</td>
                      <td className="num">{fmtNumber(r.scans)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="adm-section">
              <h2>By country</h2>
              {!d.countries.length ? (
                <p className="adm-empty">No scans yet.</p>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th className="num">Scans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.countries.map((c) => (
                      <tr key={c.country}>
                        <td className="name">{countryName(c.country)}</td>
                        <td className="num">{fmtNumber(c.scans)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        );
      })()}
    </div>
  );
}
