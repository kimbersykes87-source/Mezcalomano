import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { addDays, buildSummary, fmtMoney, fmtNumber, headlineChange, latestRuns, type Headline, type Period } from "@/lib/admin/summary";
import { londonYesterday } from "@/lib/metrics/time";
import LineChart from "./LineChart";
import AdminActions from "./AdminActions";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const PERIODS = [
  { key: "week", label: "Last week" },
  { key: "7", label: "7 days" },
  { key: "28", label: "28 days" },
  { key: "90", label: "90 days" },
] as const;

/** "week" = the last full Monday to Sunday; numbers = that many days ending yesterday (London). */
function periodRange(key: string): { from: string; to: string } {
  const yesterday = londonYesterday();
  if (key === "week") {
    const dow = new Date(`${yesterday}T12:00:00Z`).getUTCDay(); // 0 Sun .. 6 Sat
    const lastSunday = addDays(yesterday, -(dow === 0 ? 0 : dow));
    return { from: addDays(lastSunday, -6), to: lastSunday };
  }
  const n = Number(key) || 7;
  return { from: addDays(yesterday, -(n - 1)), to: yesterday };
}

const longDay = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

function Change({ h }: { h: Headline }) {
  const c = headlineChange(h);
  if (!c) return <div className="adm-tile-change">&nbsp;</div>;
  const cls = c.startsWith("+") || c === "new" ? "adm-up" : c.startsWith("-") ? "adm-down" : "";
  return (
    <div className="adm-tile-change">
      <span className={cls}>{c}</span> vs previous
    </div>
  );
}

function TopTable({ title, rows, unit, money }: { title: string; rows: { name: string; value: number }[]; unit: string; money?: boolean }) {
  return (
    <div>
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="adm-empty">Nothing yet for this period.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th className="num">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="name">{r.name}</td>
                <td className="num">{money ? fmtMoney(r.value) : fmtNumber(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Funnel({ steps }: { steps: { label: string; value: number | null }[] }) {
  const first = steps[0]?.value ?? 0;
  if (!first) return <p className="adm-empty">No shop sessions in this period yet.</p>;
  return (
    <div>
      {steps.map((s) => {
        const v = s.value ?? 0;
        const share = first ? v / first : 0;
        return (
          <div className="adm-funnel-row" key={s.label}>
            <span>{s.label}</span>
            <div className="adm-funnel-bar" style={{ width: `${Math.max(share * 100, 0.5)}%` }} />
            <span className="num" style={{ textAlign: "right" }}>
              {fmtNumber(v)} <span className="adm-sub">{Math.round(share * 100)}%</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function notesFor(p: Period, sources: string[]) {
  return sources.flatMap((s) => p.notes(s).map((n) => `${s}: ${n}`));
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireAdmin();
  const { p = "week" } = await searchParams;
  const key = PERIODS.some((x) => x.key === p) ? p : "week";
  const { from, to } = periodRange(key);
  const [summary, runs] = await Promise.all([buildSummary(from, to), latestRuns()]);
  const cur = summary.current;
  const notes = notesFor(cur, ["shop", "instagram", "tiktok"]);

  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <div>
          <div className="adm-brand">
            Mezcal<span>ó</span>mano <span>dashboard</span>
          </div>
          <div className="adm-sub">
            {longDay(from)} to {longDay(to)} (London time). Figures update every night.
          </div>
        </div>
        <nav className="adm-periods" aria-label="Period">
          {PERIODS.map((x) => (
            <a key={x.key} href={`/admin?p=${x.key}`} aria-current={x.key === key ? "page" : undefined}>
              {x.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="adm-grid" aria-label="Headline figures">
        {summary.headlines.map((h) => (
          <div className="adm-tile" key={h.key}>
            <div className="adm-tile-label">{h.label}</div>
            <div className="adm-tile-value">{h.format === "money" ? fmtMoney(h.value) : fmtNumber(h.value)}</div>
            <Change h={h} />
          </div>
        ))}
      </section>

      <section className="adm-section">
        <h2>Visits per day</h2>
        <LineChart
          label="Daily visits to mezcalomano.com and shop sessions"
          series={[
            { name: "mezcalomano.com visits", color: "#dfb725", points: cur.series("web_main", "visits") },
            { name: "Shop sessions (Shopify)", color: "#b86744", points: cur.series("shop", "sessions") },
            { name: "Shop visits (Cloudflare)", color: "#84866d", points: cur.series("web_shop", "visits") },
          ]}
        />
      </section>

      <div className="adm-cols">
        <section className="adm-section">
          <h2>Shop funnel</h2>
          <Funnel steps={summary.funnel} />
        </section>
        <section className="adm-section">
          <h2>Orders per day</h2>
          <LineChart label="Orders per day" series={[{ name: "Orders", color: "#dfb725", points: cur.series("shop", "orders") }]} />
        </section>
      </div>

      <div className="adm-cols">
        <section className="adm-section">
          <TopTable title="Top pages, mezcalomano.com" rows={cur.top("web_main", "page_views_by_path")} unit="Views" />
        </section>
        <section className="adm-section">
          <TopTable title="Top pages, shop" rows={cur.top("web_shop", "page_views_by_path")} unit="Views" />
        </section>
        <section className="adm-section">
          <TopTable title="Where site visitors came from" rows={cur.top("web_main", "visits_by_referrer")} unit="Visits" />
        </section>
        <section className="adm-section">
          <TopTable title="Where shop sessions came from" rows={cur.top("shop", "sessions_by_referrer")} unit="Sessions" />
        </section>
        <section className="adm-section">
          <TopTable title="Visitor countries, site" rows={cur.top("web_main", "visits_by_country")} unit="Visits" />
        </section>
        <section className="adm-section">
          <TopTable title="Orders by country" rows={cur.top("shop", "orders_by_country")} unit="Orders" />
        </section>
        <section className="adm-section">
          <TopTable title="Sales by product" rows={cur.top("shop", "units_by_sku")} unit="Decks" />
        </section>
        <section className="adm-section">
          <TopTable title="Producer clicks by species" rows={cur.top("clicks", "producer_clicks_by_species")} unit="Clicks" />
        </section>
        <section className="adm-section">
          <TopTable title="Outbound clicks by site" rows={cur.top("clicks", "clicks_by_host")} unit="Clicks" />
        </section>
        <section className="adm-section">
          <TopTable title="New subscribers by source" rows={cur.top("email", "new_subscribers_by_source")} unit="People" />
        </section>
      </div>

      <section className="adm-section">
        <h2>Instagram and TikTok</h2>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Figure</th>
              <th className="num">This period</th>
              <th className="num">Previous</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Instagram followers (latest)", "instagram", "followers"],
              ["Instagram new followers", "instagram", "new_followers"],
              ["Instagram unfollows", "instagram", "unfollows"],
              ["Instagram profile views", "instagram", "profile_views"],
              ["Instagram viewers (reach)", "instagram", "reach"],
              ["Instagram interactions", "instagram", "interactions"],
              ["Instagram accounts engaged", "instagram", "accounts_engaged"],
              ["Instagram views", "instagram", "views"],
              ["Instagram website clicks", "instagram", "website_clicks"],
              ["TikTok followers (latest)", "tiktok", "followers"],
              ["TikTok total likes (latest)", "tiktok", "likes_total"],
              ["TikTok video views, recent videos (latest)", "tiktok", "total_video_views"],
            ].map(([label, src, m]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="num">{fmtNumber(cur.value(src, m))}</td>
                <td className="num">{fmtNumber(summary.previous.value(src, m))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="adm-section">
        <h2>Data health</h2>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Last run</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.source}>
                <td>{r.source}</td>
                <td>
                  {new Date(r.ran_at).toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" })}
                  <div className="adm-sub">for {longDay(r.day)}</div>
                </td>
                <td className={r.ok ? "adm-ok" : "adm-err"}>{r.ok ? "OK" : r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {notes.length > 0 && (
          <ul className="adm-sub" style={{ marginTop: 10 }}>
            {notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </section>

      <AdminActions />
    </div>
  );
}
