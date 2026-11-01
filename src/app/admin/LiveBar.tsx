import { PERIODS, longDay } from "@/lib/admin/period";
import RefreshLive from "./RefreshLive";

/**
 * Top of every live page: title, period switch, the time the numbers were
 * fetched, and a Refresh now link that forces a fresh fetch from the source.
 */
export default function LiveBar({
  title,
  intro,
  path,
  periodKey,
  from,
  to,
  asOf,
  ok,
}: {
  title: string;
  intro: string;
  path: string;
  periodKey: string;
  from: string;
  to: string;
  asOf: string;
  ok: boolean;
}) {
  const time = new Date(asOf).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <header className="adm-top">
      <div>
        <h1 className="adm-live-title">{title}</h1>
        <div className="adm-sub">{intro}</div>
        <div className="adm-sub">
          {longDay(from)} to {longDay(to)} (London time){periodKey === "week" ? "" : ", includes today so far"}
        </div>
      </div>
      <div className="adm-top-right">
        <div className="adm-sub" role="status">
          <span className={`adm-dot ${ok ? "adm-dot-ok" : "adm-dot-bad"}`} aria-hidden="true" /> As of {time} London time, fetched live from the source
        </div>
        <nav className="adm-periods" aria-label="Period">
          {PERIODS.map((x) => (
            <a key={x.key} href={`${path}?p=${x.key}`} aria-current={x.key === periodKey ? "page" : undefined}>
              {x.label}
            </a>
          ))}
        </nav>
        <RefreshLive path={path} periodKey={periodKey} />
      </div>
    </header>
  );
}
