import Icon from './Icon';

// ─── Shell ────────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, unit, icon, children }) => (
  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[14px] p-[22px] flex flex-col h-full">
    <div className="flex justify-between items-start mb-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-1">{label}</p>
        <h3 className="font-['Manrope'] text-[22px] font-bold text-[var(--text-primary)]">
          {value}
          {unit && <span className="text-[12px] font-normal text-[var(--text-muted)] ml-1">{unit}</span>}
        </h3>
      </div>
      <Icon name={icon} className="text-[var(--accent)]/35 text-[22px]" />
    </div>
    {children}
  </div>
);

// ─── Calories ─────────────────────────────────────────────────────────────────
// Same 6 sample values as before: [40, 60, 45, 80, 70, 100]. Only the visual
// shape changed — dotted baseline + pill-rounded bars, matching the style
// used in SleepHoursGraph — the data source and layout are untouched.
const CALORIES_BAR_HEIGHTS = [40, 60, 45, 80, 70, 100];

export const CaloriesCard = ({ value = 0 }) => {
  const CHART_W = 240;
  const CHART_H = 48;
  const BASELINE_Y = CHART_H - 1;

  const barCount = CALORIES_BAR_HEIGHTS.length;
  const slot     = CHART_W / barCount;
  const barGap   = Math.min(slot * 0.3, 6);
  const barW     = Math.max(slot - barGap, 3);

  return (
    <StatCard
      label="Daily Burn"
      value={Number(value || 0).toLocaleString()}
      unit="kcal"
      icon="local_fire_department"
    >
      <div className="h-12 w-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
          {/* dotted baseline */}
          <line
            x1="0" y1={BASELINE_Y} x2={CHART_W} y2={BASELINE_Y}
            stroke="var(--border-light)"
            strokeWidth="2"
            strokeDasharray="1 6"
            strokeLinecap="round"
          />

          {CALORIES_BAR_HEIGHTS.map((h, i) => {
            const isLast = i === barCount - 1;
            const barH   = (h / 100) * (CHART_H - 6);
            const x      = i * slot + (slot - barW) / 2;
            const y      = BASELINE_Y - barH;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={barW / 2}
                fill="var(--accent)"
                opacity={isLast ? 1 : 0.3}
              />
            );
          })}
        </svg>
      </div>
    </StatCard>
  );
};

// ─── Session Load ─────────────────────────────────────────────────────────────
export const LoadCard = ({ minutes = 0 }) => {
  const safeMinutes = Number(minutes) || 0;
  const goal        = 120;
  const hours       = Math.floor(safeMinutes / 60);
  const remainingMins = safeMinutes % 60;
  const percentage  = Math.min((safeMinutes / goal) * 100, 100);

  return (
    <StatCard label="Session Load" value={`${hours}h ${remainingMins}m`} icon="timer">
      <div className="flex justify-between text-[10px] font-bold mb-1.5">
        <span className="text-[var(--text-muted)] uppercase">Goal: 2h 00m</span>
        <span className="text-[var(--accent)]">{Math.round(percentage)}%</span>
      </div>
      <div className="bg-[var(--bg-hover)] h-1 rounded-full overflow-hidden w-full">
        <div
          className="bg-[var(--accent)] h-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </StatCard>
  );
};

// ─── Activity Count ───────────────────────────────────────────────────────────
export const ActivityCard = ({ steps = 0 }) => (
  <StatCard label="Activity Count" value={Number(steps || 0).toLocaleString()} icon="footprint">
    <div className="flex items-baseline gap-2">
      <span className="text-[var(--accent)] text-[13px] font-bold">+12%</span>
      <span className="text-[var(--text-muted)] text-[10px] uppercase">vs yesterday</span>
    </div>
  </StatCard>
);