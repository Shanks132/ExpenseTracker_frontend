import { money } from "../format";

export interface Slice {
  label: string;
  value: number;
}

const COLORS = ["#2d4bdb", "#e07a1f", "#1a9e8f", "#c2418c", "#7a5cd6", "#8a94ad"];

// Keep the chart readable: show the biggest slices, fold the rest into "Other".
function group(slices: Slice[]): Slice[] {
  if (slices.length <= COLORS.length) return slices;
  const head = slices.slice(0, COLORS.length - 1);
  const rest = slices
    .slice(COLORS.length - 1)
    .reduce((sum, s) => sum + s.value, 0);
  return [...head, { label: "Other", value: rest }];
}

// Pure CSS pie (conic-gradient), so no chart library is needed.
// Only render this when the total is above zero.
export function PieChart({ slices }: { slices: Slice[] }) {
  const data = group(slices);
  const total = data.reduce((sum, s) => sum + s.value, 0);
  const pct = (v: number) => Math.round((v / total) * 100);

  let running = 0;
  const stops = data.map((s, i) => {
    const start = (running / total) * 100;
    running += s.value;
    const end = (running / total) * 100;
    return `${COLORS[i]} ${start}% ${end}%`;
  });

  const description = data.map((s) => `${s.label} ${pct(s.value)}%`).join(", ");

  return (
    <div className="pie-wrap">
      <div
        className="pie"
        role="img"
        aria-label={`Spending by category: ${description}`}
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
      />
      <ul className="legend">
        {data.map((s, i) => (
          <li key={s.label}>
            <span className="swatch" style={{ background: COLORS[i] }} />
            <span className="legend-label">{s.label}</span>
            <span className="legend-value">
              {money(s.value)}
              <span className="legend-pct">{pct(s.value)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
