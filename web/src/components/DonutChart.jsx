const ARC_COLORS = { gray: "#9ca3af", teal: "#14b8a6", purple: "#a78bfa" };
const LABEL_COLORS = { gray: "text-gray-500", teal: "text-teal-600", purple: "text-purple-600" };

function getCategory(habit) {
  const g = (habit.goal || "").toLowerCase();
  if (g.includes("fitness")) return { name: "Fitness", color: "teal" };
  if (g.includes("personal")) return { name: "Personal Growth", color: "purple" };
  return { name: "Health", color: "gray" };
}

function buildSegments(habits) {
  const groups = {};
  habits.forEach((h) => {
    const cat = getCategory(h);
    if (!groups[cat.name]) groups[cat.name] = { count: 0, color: cat.color };
    groups[cat.name].count++;
  });
  return Object.entries(groups).map(([name, { count, color }]) => ({
    name,
    count,
    color,
    pct: habits.length ? (count / habits.length) * 100 : 0,
  }));
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const rad = (a) => ((a - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy + r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy + r * Math.sin(rad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function DonutChart({ habits }) {
  const segments = buildSegments(habits);
  const total = habits.length;
  const cx = 80, cy = 80, r = 60;

  let angle = 0;
  const arcs = segments.map((seg) => {
    const sweep = (seg.pct / 100) * 360;
    const start = angle;
    angle += sweep;
    const end = Math.min(angle - 0.5, start + sweep);
    return { ...seg, d: describeArc(cx, cy, r, start, end) };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
        ) : arcs.map((a, i) => (
          <path key={i} d={a.d} fill="none" stroke={ARC_COLORS[a.color]} strokeWidth="20" strokeLinecap="round" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-gray-800 text-2xl font-bold">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-400 text-[11px]">total</text>
      </svg>
      <div className="space-y-1">
        {segments.map((s) => (
          <div key={s.name} className={`text-[12px] ${LABEL_COLORS[s.color]}`}>
            {s.name} {s.count} ({s.pct.toFixed(1)}%)
          </div>
        ))}
      </div>
    </div>
  );
}
