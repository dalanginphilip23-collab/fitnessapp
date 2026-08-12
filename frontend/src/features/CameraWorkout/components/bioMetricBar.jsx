export default function BiometricBar({ label, val, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 sm:mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-secondary)]">
            {label}
          </span>
        </div>
        <span
          className="text-sm sm:text-base font-black tabular-nums"
          style={{ color }}
        >
          {val}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${val}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}
