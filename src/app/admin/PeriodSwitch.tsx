import { PERIODS } from "@/lib/admin/period";

/** The 7 / 28 / 90 days / last full week switcher, linking back to the page it sits on. */
export default function PeriodSwitch({ base, active }: { base: string; active: string }) {
  return (
    <nav className="adm-periods" aria-label="Period">
      {PERIODS.map((x) => (
        <a key={x.key} href={`${base}?p=${x.key}`} aria-current={x.key === active ? "page" : undefined}>
          {x.label}
        </a>
      ))}
    </nav>
  );
}
