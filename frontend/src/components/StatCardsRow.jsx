import Icon from './Icon';

const formatSessionLoad = (mins = 0) => {
  const safe = Number(mins) || 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const StatTile = ({ icon, color, value, unit, label, progressPct }) => (
  <div className="flex-1 min-w-0 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl p-4 flex flex-col gap-2.5">
    <div className="flex items-center gap-1.5">
      <Icon name={icon} className="text-[16px]" fill={1} style={{ color }} />
      <span className="text-[10px] font-bold text-[var(--text-muted)] truncate">{label}</span>
    </div>

    <span className="stat-digital text-[24px] sm:text-[26px] font-extrabold text-[var(--text-primary)] leading-none tracking-tight">
      {value}
    </span>

    <div className="flex flex-col gap-1">
      <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(Math.max(progressPct, 0), 100)}%`, background: color }}
        />
      </div>
      {unit && <span className="text-[9px] font-semibold text-[var(--text-muted)]">{unit}</span>}
    </div>
  </div>
);

const StatCardsRow = ({
  calories = { value: 0, goal: 800 },
  steps = { value: 0, goal: 10000 },
  sessionLoadMins = { value: 0, goal: 120 },
}) => {
  const pct = (value, goal) => (goal > 0 ? (Number(value || 0) / goal) * 100 : 0);

  return (
    <div className="flex items-stretch gap-3 sm:gap-4">
      <StatTile
        icon="local_fire_department"
        color="var(--metric-calories)"
        value={Number(calories.value || 0).toLocaleString()}
        unit="kcal"
        label="Calories"
        progressPct={pct(calories.value, calories.goal)}
      />
      <StatTile
        icon="footprint"
        color="var(--metric-steps)"
        value={Number(steps.value || 0).toLocaleString()}
        unit="steps"
        label="Steps"
        progressPct={pct(steps.value, steps.goal)}
      />
      <StatTile
        icon="timer"
        color="var(--metric-load)"
        value={formatSessionLoad(sessionLoadMins.value)}
        unit="h:m"
        label="Session"
        progressPct={pct(sessionLoadMins.value, sessionLoadMins.goal)}
      />
    </div>
  );
};

export default StatCardsRow;
