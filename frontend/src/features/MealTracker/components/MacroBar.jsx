export default function MacroBar({ label, value, unit, color, pct }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-(--text-muted)">{label}</span>
        <span className="text-xs font-semibold text-(--text-primary)">{value}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-(--bg-hover) overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}