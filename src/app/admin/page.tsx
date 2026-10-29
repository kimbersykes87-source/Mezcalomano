import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { addDays, buildSummary, fmtMoney, fmtNumber, headlineChange, latestRuns, type Headline, type Period } from "@/lib/admin/summary";
import { latestInstagram, postCards } from "@/lib/admin/instagram-manual";
import { londonToday, londonYesterday } from "@/lib/metrics/time";
import LineChart from "./LineChart";
import AdminActions from "./AdminActions";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const PERIODS = [
  { key: "7", label: "7 days" },
  { key: "28", label: "28 days" },
  { key: "90", label: "90 days" },
  { key: "week", label: "Last full week" },
] as const;

/** "week" = the last full Monday to Sunday; numbers = that many days ending today so far (London). */
function periodRange(key: string): { from: string; to: string } {
  const yesterday = londonYesterday();
  if (key === "week") {
    const dow = new Date(`${yesterday}T12:00:00Z`).getUTCDay(); // 0 Sun .. 6 Sat
    const lastSunday = addDays(yesterday, -(dow === 0 ? 0 : dow));
    return { from: addDays(lastSunday, -6), to: lastSunday };
  }
  const n = Number(key) || 7;
  const today = londonToday();
  return { from: addDays(today, -(n - 1)), to: today }; // includes today so far
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

const SOURCE_NAMES: Record<string, string> = {
  web_main: "Website visits (Cloudflare)",
  web_shop: "Shop visits (Cloudflare)",
  shop: "Shop and orders (Shopify)",
  email: "Email list",
  contact: "Contact messages",
  clicks: "Outbound clicks",
  instagram: "Instagram (API)",
  instagram_manual: "Instagram (browser or form)",
  tiktok: "TikTok",
  weekly_email: "Monday email",
  weekly_email_test: "Monday email (test)",
  instagram_reminder: "Sunday reminder",
};

const KEY_TILES = ["orders", "net_sales", "site_visits", "shop_sessions", "ig_followers", "list_total"];

function Tile({ h }: { h: Headline }) {
  return (
    <div className="adm-tile">
      <div className="adm-tile-label">{h.label}</div>
      <div className="adm-tile-value">{h.format === "money" ? fmtMoney(h.value) : fmtNumber(h.value)}</div>
      <Change h={h} />
    </div>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireAdmin();
  const { p = "7" } = await searchParams;
  const key = PERIODS.some((x) => x.key === p) ? p : "7";
  const { from, to } = periodRange(key);
  const [summary, runs, ig, posts] = await Promise.all([buildSummary(from, to), latestRuns(), latestInstagram(), postCards()]);
  const cur = summary.current;
  const notes = notesFor(cur, ["shop", "instagram", "tiktok"]);
  const head = (k: string) => summary.headlines.find((h) => h.key === k);
  const failing = runs.filter((r) => !r.ok && !r.source.endsWith("_test"));
  const lastRun = runs.length ? new Date(Math.max(...runs.map((r) => new Date(r.ran_at).getTime()))) : null;
  const lastRunText = lastRun ? lastRun.toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" }) : "never";
  const tiktok = head("tt_followers");
  const tiles = KEY_TILES.map(head).filter((h): h is Headline => Boolean(h));
  const hasTikTok = tiktok && tiktok.value !== null;
  const igRows = ig
    ? ([
        ["Total followers", "followers", true],
        ["Following", "following", true],
        ["Posts", "posts", true],
        ["Profile visits", "profile_views", false],
        ["Views", "views", false],
        ["Viewers", "reach", false],
        ["Interactions", "interactions", false],
        ["Accounts engaged", "accounts_engaged", false],
        ["External link taps", "website_clicks", false],
      ] as const).filter(([, m]) => ig.values[m] !== undefined)
    : [];
  const maxViews = Math.max(1, ...posts.cards.map((c) => c.views));

  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <div>
          <div className="adm-brand">
            Mezcal<span>ó</span>mano <span>dashboard</span>
          </div>
          <div className="adm-sub">
            {longDay(from)} to {longDay(to)} (London time). Counting started 28 Oct 2026. Figures update every night.
          </div>
        </div>
        <div className="adm-top-right">
          <details className={`adm-health${failing.length ? " adm-health-bad" : ""}`} open={failing.length > 0}>
            <summary>
              <span className="adm-dot" aria-hidden="true" />
              {failing.length
                ? `${failing.length} source${failing.length === 1 ? "" : "s"} need attention`
                : `All ${runs.length} sources OK, last run ${lastRunText}`}
            </summary>
            <div className="adm-health-body">
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
                      <td>{SOURCE_NAMES[r.source] ?? r.source}</td>
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
            </div>
          </details>
          <nav className="adm-periods" aria-label="Period">
            {PERIODS.map((x) => (
              <a key={x.key} href={`/admin?p=${x.key}`} aria-current={x.key === key ? "page" : undefined}>
                {x.label}
              </a>
            ))}
          </nav>
          {key !== "week" && <div className="adm-sub">Includes today so far</div>}
        </div>
      </header>

      <nav className="adm-sections" aria-label="Sections">
        <a href="#sales">Sales</a>
        <a href="#traffic">Traffic</a>
        <a href="#audience">Audience and Instagram</a>
        <a href="#engagement">Engagement</a>
      </nav>

      <section className="adm-grid" aria-label="Key numbers">
        {tiles.map((h) => (
          <Tile key={h.key} h={h} />
        ))}
        {hasTikTok && tiktok && <Tile h={tiktok} />}
      </section>

      <section className="adm-section" id="sales">
        <h2>Sales</h2>
        <div className="adm-cols">
          <div>
            <h3 className="adm-h3">Shop funnel</h3>
            <Funnel steps={summary.funnel} />
          </div>
          <div>
            <h3 className="adm-h3">Orders per day</h3>
            <LineChart label="Orders per day" series={[{ name: "Orders", color: "#dfb725", points: cur.series("shop", "orders") }]} />
          </div>
        </div>
      </section>

      <section className="adm-section" id="traffic">
        <h2>Traffic</h2>
        <LineChart
          label="Daily visits to mezcalomano.com and shop sessions"
          series={[
            { name: "mezcalomano.com visits", color: "#dfb725", points: cur.series("web_main", "visits") },
            { name: "Shop sessions (Shopify)", color: "#b86744", points: cur.series("shop", "sessions") },
          ]}
        />
        <div className="adm-cols" style={{ marginTop: 16 }}>
          <TopTable title="Top pages, mezcalomano.com" rows={cur.top("web_main", "page_views_by_path")} unit="Views" />
          <TopTable title="Where site visitors came from" rows={cur.top("web_main", "visits_by_referrer")} unit="Visits" />
          <TopTable title="Where shop sessions came from" rows={cur.top("shop", "sessions_by_referrer")} unit="Sessions" />
        </div>
      </section>

      <section className="adm-section" id="audience">
        <h2>Audience and Instagram</h2>
        {ig ? (
          <>
            <p className="adm-sub" style={{ marginTop: 0 }}>
              Newest entry, for the week ending {longDay(ig.day)}. Taken from the Instagram insights page every Sunday at 5:30 pm London;
              <a href="/admin/instagram"> enter by hand</a> if it ever fails.
              {ig.prevDay ? ` Change is against ${longDay(ig.prevDay)}.` : ""}
            </p>
            <div className="adm-mini-grid">
              {igRows.map(([label, m, level]) => {
                const diff = level && ig.prev[m] !== undefined ? ig.values[m] - ig.prev[m] : null;
                return (
                  <div className="adm-mini" key={m}>
                    <div className="adm-tile-label">{label}</div>
                    <div className="adm-mini-value">{fmtNumber(ig.values[m])}</div>
                    <div className={`adm-tile-change ${diff && diff > 0 ? "adm-up" : diff && diff < 0 ? "adm-down" : ""}`}>
                      {diff === null ? "\u00a0" : diff === 0 ? "no change" : `${diff > 0 ? "+" : ""}${fmtNumber(diff)}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="adm-empty">No Instagram figures yet.</p>
        )}

        <h3 className="adm-h3" style={{ marginTop: 20 }}>
          Posts, by views ({posts.cards.length})
        </h3>
        {posts.cards.length === 0 ? (
          <p className="adm-empty">No posts recorded yet.</p>
        ) : (
          <div className="adm-posts">
            {posts.cards.map((c) => (
              <a className="adm-post" key={c.shortcode} href={`https://www.instagram.com/p/${c.shortcode}/`} target="_blank" rel="noopener noreferrer">
                {c.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumb} alt={c.alt} loading="lazy" width={480} height={600} />
                ) : (
                  <div className="adm-post-blank">Open on Instagram</div>
                )}
                <div className="adm-post-body">
                  <div className="adm-post-title">{c.title}</div>
                  <div className="adm-post-meta">
                    <span>
                      {fmtNumber(c.views)} views
                      {c.change ? <span className={c.change > 0 ? "adm-up" : "adm-down"}> {c.change > 0 ? "+" : ""}{c.change}</span> : null}
                    </span>
                    <span>{c.postedOn ? longDay(c.postedOn) : ""}</span>
                  </div>
                  <div className="adm-post-bar">
                    <div style={{ width: `${Math.max(2, Math.round((c.views / maxViews) * 100))}%` }} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        <div className="adm-cols" style={{ marginTop: 18 }}>
          <TopTable title="New email subscribers by source" rows={cur.top("email", "new_subscribers_by_source")} unit="People" />
        </div>
      </section>

      <section className="adm-section" id="engagement">
        <h2>Engagement</h2>
        <div className="adm-mini-grid" style={{ marginBottom: 16 }}>
          {(["producer_clicks", "new_subscribers", "contact"] as const).map((k) => {
            const h = head(k);
            return h ? (
              <div className="adm-mini" key={k}>
                <div className="adm-tile-label">{h.label}</div>
                <div className="adm-mini-value">{fmtNumber(h.value)}</div>
                <Change h={h} />
              </div>
            ) : null;
          })}
        </div>
        <div className="adm-cols">
          <TopTable title="Producer clicks by species" rows={cur.top("clicks", "producer_clicks_by_species")} unit="Clicks" />
          <TopTable title="Outbound clicks by site" rows={cur.top("clicks", "clicks_by_host")} unit="Clicks" />
        </div>
      </section>

      <details className="adm-section adm-more">
        <summary>More tables: countries, sales by product, shop pages</summary>
        <div className="adm-cols" style={{ marginTop: 12 }}>
          <TopTable title="Visitor countries, site" rows={cur.top("web_main", "visits_by_country")} unit="Visits" />
          <TopTable title="Orders by country" rows={cur.top("shop", "orders_by_country")} unit="Orders" />
          <TopTable title="Sales by product" rows={cur.top("shop", "units_by_sku")} unit="Decks" />
          <TopTable title="Top pages, shop" rows={cur.top("web_shop", "page_views_by_path")} unit="Views" />
        </div>
      </details>

      <AdminActions />
    </div>
  );
}
