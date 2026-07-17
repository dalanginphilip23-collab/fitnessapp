import Icon from './Icon';
import RadialProgress from './RadialProgress';

const formatSessionLoad = (mins = 0) => {
  const safe = Number(mins) || 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const RingLabel = ({ icon, color, children }) => (
  <div className="flex items-center gap-1">
    <Icon name={icon} className="text-[11px]" style={{ color }} />
    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
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

      {/* Rings row */}
      <div className="flex items-start justify-around">
        <div className="flex flex-col items-center gap-2.5">
          <RadialProgress
            value={calories.value}
            goal={calories.goal}
            color="var(--accent)"
            displayValue={Number(calories.value || 0).toLocaleString()}
          />
          <RingLabel icon="local_fire_department" color="var(--accent)">Calories</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <RadialProgress
            value={steps.value}
            goal={steps.goal}
            color="#60a5fa"
            displayValue={Number(steps.value || 0).toLocaleString()}
          />
          <RingLabel icon="footprint" color="#60a5fa">Steps</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <RadialProgress
            value={sessionLoadMins.value}
            goal={sessionLoadMins.goal}
            color="#f2c448"
            displayValue={formatSessionLoad(sessionLoadMins.value)}
          />
          <RingLabel icon="timer" color="#f2c448">Session Load</RingLabel>
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