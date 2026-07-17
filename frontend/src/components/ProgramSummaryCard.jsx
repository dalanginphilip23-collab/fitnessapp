import Icon from './Icon';
import RadialProgress from './RadialProgress';

const formatSessionLoad = (mins = 0) => {
  const safe = Number(mins) || 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const pctOf = (value = 0, goal = 1) => {
  const safeGoal = goal > 0 ? goal : 1;
  return Math.min(Math.max((Number(value) || 0) / safeGoal, 0), 1);
};

/* Compact stat tile — used for the secondary metrics next to the
   featured ring (mirrors the reference's "Calories burn / Weight lose"
   tile pair). */
const StatTile = ({ icon, color, label, value, sub }) => (
  <div className="flex-1 flex items-center gap-3 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-2xl px-4 py-3.5 min-w-0">
    <div
      className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)` }}
    >
      <Icon name={icon} className="text-[16px]" style={{ color }} fill={1} />
    </div>
    <div className="min-w-0">
      <p className="stat-digital text-[15px] font-extrabold text-[var(--text-primary)] leading-tight truncate m-0">
        {value}
      </p>
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)] m-0 truncate">
        {sub || label}
      </p>
    </div>
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
  // Overall completion driving the big featured ring — average progress
  // across all three tracked metrics, same source data as before, just
  // aggregated for the "Core Target"-style hero ring.
  const overallPct = Math.round(
    ((pctOf(calories.value, calories.goal) +
      pctOf(steps.value, steps.goal) +
      pctOf(sessionLoadMins.value, sessionLoadMins.goal)) /
      3) *
      100
  );

  return (
    <div className="bg-[var(--bg-card)] bg-[image:var(--card-gradient)] border border-[var(--border-light)] shadow-[var(--shadow-sm)] rounded-[var(--card-radius-lg)] p-[22px] flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]" />
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

      {/* Featured ring + stat tiles row */}
      <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <RadialProgress
            value={overallPct}
            goal={100}
            size={128}
            strokeWidth={10}
            color="var(--accent)"
            displayValue={`${overallPct}%`}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Core Target
          </span>
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-[160px]">
          <StatTile
            icon="local_fire_department"
            color="var(--accent)"
            value={Number(calories.value || 0).toLocaleString()}
            sub="Calories burn"
          />
          <StatTile
            icon="footprint"
            color="#60a5fa"
            value={Number(steps.value || 0).toLocaleString()}
            sub="Steps"
          />
          <StatTile
            icon="timer"
            color="#f2c448"
            value={formatSessionLoad(sessionLoadMins.value)}
            sub="Session Load"
          />
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onChangeProgram}
          className="flex-1 bg-[var(--accent)] text-[#131313] text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-2xl hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          Change Program
        </button>
        <button
          type="button"
          onClick={onSeeMore}
          className="flex-1 bg-transparent text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-2xl border border-[var(--border-medium)] hover:bg-[var(--bg-hover)] active:scale-[0.98] transition-all cursor-pointer"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default ProgramSummaryCard;