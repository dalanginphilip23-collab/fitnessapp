const RadialProgress = ({
  value = 0,
  goal = 100,
  size = 88,
  strokeWidth = 7,
  color = 'var(--accent)',
  trackColor = 'var(--bg-hover)',
  displayValue,
  label,
}) => {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = Math.min(Math.max((value / safeGoal) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const shown = displayValue ?? `${Math.round(pct)}%`;

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-['Manrope'] font-extrabold text-[var(--text-primary)] tracking-tight"
            style={{ fontSize: size * 0.19 }}
          >
            {shown}
          </span>
        </div>
      </div>

      {label && (
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {label}
        </span>
      )}
    </div>
  );
};

export default RadialProgress;