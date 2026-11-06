import { fmtNumber, headlineChange, type Headline } from "@/lib/admin/summary";
import type { PostCard } from "@/lib/admin/instagram-manual";
import { longDay } from "@/lib/admin/period";
import LineChart, { type Series } from "../LineChart";
import PeriodSwitch from "../PeriodSwitch";

export type Stat = { key: string; label: string; value: number | null; previous: number | null; kind: "level" | "flow"; help: string };

export type SocialData = {
  periodKey: string;
  rangeText: string;
  instagram: {
    ok: boolean | null;
    lastRun: string | null;
    figuresDay: string | null;
    tokenDays: number | null;
    detail: string | null;
  };
  audience: Stat[];
  activity: Stat[];
  viewsChart: Series[];
  actionsChart: Series[];
  posts: PostCard[];
  socialVisits: { name: string; value: number }[];
  tiktokFollowers: number | null;
};

function StatTile({ s }: { s: Stat }) {
  const h: Headline = { key: s.key, label: s.label, value: s.value, previous: s.previous, format: "number", kind: s.kind };
  const c = headlineChange(h);
  const cls = c && (c.startsWith("+") || c === "new") ? "adm-up" : c && c.startsWith("-") ? "adm-down" : "";
  return (
    <div className="adm-tile">
      <div className="adm-tile-label">{s.label}</div>
      <div className="adm-tile-value">{fmtNumber(s.value)}</div>
      <div className="adm-tile-change">
        {c ? (
          <>
            <span className={cls}>{c}</span> vs previous
          </>
        ) : (
          <>&nbsp;</>
        )}
      </div>
      <div className="adm-tile-help">{s.help}</div>
    </div>
  );
}

function Status({ d }: { d: SocialData["instagram"] }) {
  const state = d.ok === null ? "none" : d.ok ? "ok" : "bad";
  const tokenLow = d.tokenDays !== null && d.tokenDays < 14;
  return (
    <div className="adm-status" role="status">
      <div className={`adm-status-item adm-status-${state}`}>
        <span className="adm-dot" aria-hidden="true" />
        <span>
          <strong>Instagram</strong>{" "}
          {state === "ok" ? "connected" : state === "bad" ? `needs attention: ${d.detail ?? "last pull failed"}` : "no pull yet"}
        </span>
      </div>
      {d.lastRun && <div className="adm-status-item adm-status-note">Last pull {d.lastRun}</div>}
      {d.tokenDays !== null && (
        <div className={`adm-status-item adm-status-note${tokenLow ? " adm-err" : ""}`}>
          Login renews itself, {Math.round(d.tokenDays)} days left
        </div>
      )}
    </div>
  );
}

export default function SocialView({ data }: { data: SocialData }) {
  const { posts } = data;
  const maxViews = Math.max(1, ...posts.map((c) => c.views));
  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <div>
          <h1 className="adm-live-title">Social Media</h1>
          <div className="adm-sub">{data.rangeText}</div>
        </div>
        <PeriodSwitch base="/admin/social" active={data.periodKey} />
      </header>

      <nav className="adm-sections" aria-label="Sections">
        <a href="#instagram">Instagram</a>
        <a href="#posts">Posts</a>
        <a href="#to-site">To the site</a>
        <a href="#tiktok">TikTok</a>
      </nav>

      <section className="adm-section" id="instagram">
        <h2>Instagram @mezcalomano</h2>
        <Status d={data.instagram} />

        <h3 className="adm-h3">Audience</h3>
        <div className="adm-grid">
          {data.audience.map((s) => (
            <StatTile key={s.key} s={s} />
          ))}
        </div>

        <h3 className="adm-h3">Activity in this period</h3>
        <div className="adm-grid">
          {data.activity.map((s) => (
            <StatTile key={s.key} s={s} />
          ))}
        </div>

        <div className="adm-cols">
          <div>
            <h3 className="adm-h3">Views and viewers per day</h3>
            <LineChart label="Instagram views and viewers per day" series={data.viewsChart} />
          </div>
          <div>
            <h3 className="adm-h3">Profile visits and link taps per day</h3>
            <LineChart label="Instagram profile visits and link taps per day" series={data.actionsChart} />
          </div>
        </div>
        {data.instagram.figuresDay && (
          <p className="adm-sub adm-foot">
            Pulled from Instagram every night. Newest figures are for {longDay(data.instagram.figuresDay)}. If a pull ever fails you can{" "}
            <a href="/admin/instagram">enter the week by hand</a>.
          </p>
        )}
      </section>

      <section className="adm-section" id="posts">
        <h2>Posts, most viewed first ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="adm-empty">No posts recorded yet.</p>
        ) : (
          <div className="adm-posts">
            {posts.map((c) => (
              <a className="adm-post" key={c.shortcode} href={`https://www.instagram.com/p/${c.shortcode}/`} target="_blank" rel="noopener noreferrer">
                {c.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumb} alt={c.alt} loading="lazy" width={480} height={600} />
                ) : (
                  <div className="adm-post-blank">Open on Instagram</div>
                )}
                <div className="adm-post-body">
                  <div className="adm-post-title">{c.title}</div>
                  <div className="adm-post-big">
                    {fmtNumber(c.views)} <span>views</span>
                    {c.change ? <span className={c.change > 0 ? "adm-up" : "adm-down"}> {c.change > 0 ? "+" : ""}{c.change}</span> : null}
                  </div>
                  <div className="adm-post-bar">
                    <div style={{ width: `${Math.max(2, Math.round((c.views / maxViews) * 100))}%` }} />
                  </div>
                  <div className="adm-post-meta">
                    <span>
                      {c.likes === null && c.comments === null ? "" : `${fmtNumber(c.likes ?? 0)} likes, ${fmtNumber(c.comments ?? 0)} comments`}
                    </span>
                  </div>
                  {c.postedOn && <div className="adm-post-meta"><span>{longDay(c.postedOn)}</span></div>}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="adm-section" id="to-site">
        <h2>From social to the site</h2>
        <div className="adm-cols">
          <div>
            <h3 className="adm-h3">Website visits that came from social</h3>
            {data.socialVisits.length === 0 ? (
              <p className="adm-empty">No visits from social in this period yet.</p>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Came from</th>
                    <th className="num">Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.socialVisits.map((r) => (
                    <tr key={r.name}>
                      <td className="name">{r.name}</td>
                      <td className="num">{fmtNumber(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="adm-sub">
            Instagram link taps above count people who tapped the link in the bio. Visits here are the ones that reached mezcalomano.com,
            as seen by the website itself.
          </p>
        </div>
      </section>

      <section className="adm-section" id="tiktok">
        <h2>TikTok</h2>
        {data.tiktokFollowers === null ? (
          <p className="adm-empty">Not connected yet. When it is, followers, views and likes will show here in the same layout as Instagram.</p>
        ) : (
          <div className="adm-grid">
            <StatTile s={{ key: "tt", label: "TikTok followers", value: data.tiktokFollowers, previous: null, kind: "level", help: "People following the account" }} />
          </div>
        )}
      </section>
    </div>
  );
}
