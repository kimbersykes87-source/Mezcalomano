import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { fmtNumber } from "@/lib/admin/summary";
import { periodKey as readPeriod, periodRange } from "@/lib/admin/period";
import { liveCached } from "@/lib/sources/cache";
import { liveEmail } from "@/lib/sources/email";
import LiveBar from "../LiveBar";
import LineChart from "../LineChart";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Email" };

const STATE_LABELS: Record<string, string> = {
  SUBSCRIBED: "Subscribed",
  NOT_SUBSCRIBED: "Customer, not subscribed",
  UNSUBSCRIBED: "Unsubscribed",
  PENDING: "Waiting for confirmation",
  REDACTED: "Removed on request",
  INVALID: "Invalid address",
  NO_EMAIL: "No email address",
};

function Tile({ label, value, note }: { label: string; value: number | null; note?: string }) {
  return (
    <div className="adm-tile">
      <div className="adm-tile-label">{label}</div>
      <div className="adm-tile-value">{fmtNumber(value)}</div>
      <div className="adm-tile-change">{note ?? " "}</div>
    </div>
  );
}

function Failed({ what, error }: { what: string; error: string }) {
  return (
    <div className="adm-fail">
      <strong>{what} could not load.</strong> {error}
      <div className="adm-sub">Use Refresh now to try again.</div>
    </div>
  );
}

export default async function EmailPage({ searchParams }: { searchParams: Promise<{ p?: string; fresh?: string }> }) {
  await requireAdmin("/email");
  const sp = await searchParams;
  const key = readPeriod(sp.p);
  const { from, to } = periodRange(key);
  const live = await liveCached(`email:${from}:${to}`, Boolean(sp.fresh), () => liveEmail(from, to));
  const { list, campaigns, contacts } = live.data;
  const l = list.ok ? list.data : null;
  const net = l ? l.joined - l.left : null;
  const accessDenied = !campaigns.ok && /access denied|scope|permission/i.test(campaigns.error);

  return (
    <div className="adm-wrap">
      <LiveBar
        title="Email"
        intro="Mailing list size, new subscribers and where they came from, unsubscribes and recent campaigns. The list is Shopify customers who agreed to marketing email."
        path="/admin/email"
        periodKey={key}
        from={from}
        to={to}
        asOf={live.asOf}
        ok={list.ok && contacts.ok}
      />

      {!list.ok && <Failed what="The mailing list" error={list.error} />}
      {l && (
        <section className="adm-grid" aria-label="Mailing list">
          <Tile label="On the mailing list" value={l.total} note="Subscribed right now" />
          <Tile label="New subscribers" value={l.joined} note="In this period" />
          <Tile label="Unsubscribes" value={l.left} note="In this period" />
          <Tile label="Net change" value={net} note="New minus unsubscribes" />
          <Tile label="From the website form" value={l.joinedWebsite} note="Tagged website-signup" />
          <Tile label="Checkout or other" value={l.joinedOther} note="Consent at checkout, imports" />
        </section>
      )}

      <div className="adm-cols">
        {l && (
          <section className="adm-section">
            <h2>New subscribers per day</h2>
            <LineChart
              label="New subscribers per day"
              series={[
                { name: "New", color: "#dfb725", points: l.daily.map((d) => ({ day: d.day, value: d.joined })) },
                { name: "Unsubscribed", color: "#d9694a", points: l.daily.map((d) => ({ day: d.day, value: d.left })) },
              ]}
            />
          </section>
        )}
        {l && (
          <section className="adm-section">
            <h2>Everyone in Shopify, by email status</h2>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th className="num">People</th>
                </tr>
              </thead>
              <tbody>
                {l.states.map((s) => (
                  <tr key={s.name}>
                    <td className="name">{STATE_LABELS[s.name] ?? s.name}</td>
                    <td className="num">{fmtNumber(s.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>

      <div className="adm-cols">
        <section className="adm-section">
          <h2>Recent campaigns and automations</h2>
          {campaigns.ok ? (
            campaigns.data.length ? (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th className="num">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.data.map((c) => (
                    <tr key={`${c.title}${c.createdAt}`}>
                      <td className="name">{c.title}</td>
                      <td>{c.status}</td>
                      <td className="num">{new Date(c.createdAt).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="adm-empty">No campaigns sent from Shopify Email yet.</p>
            )
          ) : accessDenied ? (
            <p className="adm-empty">
              Shopify has not given the dashboard permission to read campaigns yet (the read_marketing_events access scope). Campaign names will appear
              here once that is added. Opens and clicks are not available from Shopify&apos;s API either way.
            </p>
          ) : (
            <Failed what="Campaigns" error={campaigns.error} />
          )}
        </section>
        <section className="adm-section">
          <h2>Contact form messages</h2>
          {contacts.ok ? (
            <div className="adm-mini-grid">
              <div className="adm-mini">
                <div className="adm-tile-label">Messages in this period</div>
                <div className="adm-mini-value">{fmtNumber(contacts.data)}</div>
              </div>
            </div>
          ) : (
            <Failed what="Contact messages" error={contacts.error} />
          )}
        </section>
      </div>

      <p className="adm-sub">
        How this is counted: a person counts as new or unsubscribed on the day their marketing consent last changed in Shopify. Open rates are left out
        on purpose, because Apple Mail Privacy Protection makes them unreliable. List growth and clicks are the real signals. No email addresses are shown on this page.
      </p>
    </div>
  );
}
