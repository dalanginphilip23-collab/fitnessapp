import Icon from './Icon';

const formatSessionLoad = (mins = 0) => {
  const safe = Number(mins) || 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

// Flat stat tile — icon, big value, unit, caps label. Used for the three
// headline metrics (calories / steps / session load) inside the summary card.
const StatTile = ({ icon, color, value, unit, label }) => (
  <div className="flex-1 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl py-4 px-3 flex flex-col items-center gap-1.5">
    <Icon name={icon} className="text-[20px]" fill={1} style={{ color }} />
    <span className="stat-digital text-[22px] font-extrabold text-[var(--text-primary)] leading-none tracking-tight">
      {value}
    </span>
    {unit && (
      <span className="text-[11px] font-semibold leading-none" style={{ color }}>
        {unit}
      </span>
    )}
    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] mt-0.5">
      {label}
    </span>
  </div>
);

const ProgramSummaryCard = ({
  goalLabel = 'No active program',
  calories = { value: 0, goal: 800 },
  steps = { value: 0, goal: 10000 },
  sessionLoadMins = { value: 0, goal: 120 },
  weekLabel = 'For the week',
  onChangeProgram,
  onSeeMore,
}) => {
  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[20px] p-[22px] flex flex-col gap-6 card-glow">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          <span className="text-[12px] font-bold text-[var(--text-secondary)]">{goalLabel}</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors bg-transparent border-none cursor-pointer"
        >
          {weekLabel}
          <Icon name="expand_more" className="text-[14px]" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-stretch gap-3">
        <StatTile
          icon="local_fire_department"
          color="var(--accent)"
          value={Number(calories.value || 0).toLocaleString()}
          unit="kcal"
          label="Calories"
        />
        <StatTile
          icon="footprint"
          color="var(--metric-steps)"
          value={Number(steps.value || 0).toLocaleString()}
          unit="steps"
          label="Steps"
        />
        <StatTile
          icon="timer"
          color="var(--metric-load)"
          value={formatSessionLoad(sessionLoadMins.value)}
          unit="h:m"
          label="Session Load"
        />
      </div>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onChangeProgram}
          className="flex-1 btn-primary relative bg-(--accent) text-(--text-inverse) text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          Change Program
        </button>
        <button
          type="button"
          onClick={onSeeMore}
          className="flex-1 bg-transparent text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-xl border border-[var(--border-medium)] hover:bg-[var(--bg-hover)] hover:border-[var(--accent-border)] active:scale-[0.98] transition-all cursor-pointer"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default ProgramSummaryCard;