/** Small server-rendered SVG line chart for daily series (no chart library). */

type Series = { name: string; color: string; points: { day: string; value: number | null }[] };

const W = 520;
const H = 200;
const PAD = { l: 46, r: 14, t: 12, b: 30 };

function niceMax(v: number): number {
  if (v <= 5) return 5;
  const mag = 10 ** Math.floor(Math.log10(v));
  const n = v / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

const shortDay = (d: string) =>
  `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8))}`;

export default function LineChart({ series, label }: { series: Series[]; label: string }) {
  const days = series[0]?.points.map((p) => p.day) ?? [];
  const all = series.flatMap((s) => s.points.map((p) => p.value ?? 0));
  if (!days.length || all.every((v) => v === 0)) {
    return <p className="adm-empty">No data for this period yet.</p>;
  }
  const max = niceMax(Math.max(...all));
  const x = (i: number) => PAD.l + (days.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i / (days.length - 1)) * (W - PAD.l - PAD.r));
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const ticks = [0, max / 2, max];
  const labelEvery = Math.max(1, Math.ceil(days.length / 7));

  return (
    <figure style={{ margin: 0 }}>
      <svg className="adm-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.1)" />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" fontSize="14" fill="rgba(243,241,234,0.6)">
              {Math.round(t).toLocaleString("en-US")}
            </text>
          </g>
        ))}
        {days.map((d, i) =>
          i % labelEvery === 0 || i === days.length - 1 ? (
            <text key={d} x={x(i)} y={H - 8} textAnchor="middle" fontSize="14" fill="rgba(243,241,234,0.6)">
              {shortDay(d)}
            </text>
          ) : null
        )}
        {series.map((s) => {
          const pts = s.points.map((p, i) => (p.value === null ? null : `${x(i)},${y(p.value)}`)).filter(Boolean);
          return (
            <g key={s.name}>
              <polyline points={pts.join(" ")} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" />
              {s.points.map((p, i) =>
                p.value === null ? null : (
                  <circle key={p.day} cx={x(i)} cy={y(p.value)} r={days.length > 40 ? 0 : 3} fill={s.color}>
                    <title>{`${s.name}, ${shortDay(p.day)}: ${p.value.toLocaleString("en-US")}`}</title>
                  </circle>
                )
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="adm-legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
