import Icon from './Icon';
import RadialProgress from './RadialProgress';

const formatSessionLoad = (mins = 0) => {
  const safe = Number(mins) || 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const RingLabel = ({ icon, color, children }) => (
  <div className="flex items-center gap-1.5">
    <Icon name={icon} className="text-[13px]" style={{ color }} />
    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
      {children}
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
    <div className="fx-card p-6 sm:p-7 flex flex-col gap-7">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          <span className="text-[14px] font-bold text-[var(--text-primary)]">{goalLabel}</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors bg-transparent border-none cursor-pointer"
        >
          {weekLabel}
          <Icon name="expand_more" className="text-[14px]" />
        </button>
      </div>

      {/* Rings row — enlarged, more breathing room */}
      <div className="flex items-start justify-around py-2">
        <div className="flex flex-col items-center gap-3">
          <RadialProgress
            value={calories.value}
            goal={calories.goal}
            size={104}
            strokeWidth={9}
            color="var(--metric-calories)"
            displayValue={Number(calories.value || 0).toLocaleString()}
          />
          <RingLabel icon="local_fire_department" color="var(--metric-calories)">Calories</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-3">
          <RadialProgress
            value={steps.value}
            goal={steps.goal}
            size={104}
            strokeWidth={9}
            color="var(--metric-steps)"
            displayValue={Number(steps.value || 0).toLocaleString()}
          />
          <RingLabel icon="footprint" color="var(--metric-steps)">Steps</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-3">
          <RadialProgress
            value={sessionLoadMins.value}
            goal={sessionLoadMins.goal}
            size={104}
            strokeWidth={9}
            color="var(--metric-load)"
            displayValue={formatSessionLoad(sessionLoadMins.value)}
          />
          <RingLabel icon="timer" color="var(--metric-load)">Session Load</RingLabel>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onChangeProgram}
          className="flex-1 bg-[var(--accent)] text-[#131313] text-[11px] font-black uppercase tracking-[0.14em] py-4 rounded-2xl hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          Change Program
        </button>
        <button
          type="button"
          onClick={onSeeMore}
          className="flex-1 bg-transparent text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.14em] py-4 rounded-2xl border border-[var(--border-medium)] hover:bg-[var(--bg-hover)] active:scale-[0.98] transition-all cursor-pointer"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default ProgramSummaryCard;
