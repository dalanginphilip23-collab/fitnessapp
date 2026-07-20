import Icon from './Icon';
import RadialProgress from './RadialProgress';

const formatSessionLoad = (mins = 0) => {
  const safe = Number(mins) || 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const RingLabel = ({ icon, color, children }) => (
  <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 text-center">
    <Icon name={icon} className="text-[11px]" style={{ color }} />
    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] sm:tracking-[0.18em] text-[var(--text-muted)] leading-tight whitespace-nowrap">
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
    <div className="fx-card shadow-[var(--shadow-sm)] p-[22px] sm:p-[26px] flex flex-col gap-6">
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

      {/* Rings row — each metric gets its own soft chip, mockup-style */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="flex flex-col items-center gap-2.5 rounded-[20px] py-4 sm:py-5 px-2" style={{ background: 'color-mix(in srgb, var(--accent) 7%, transparent)' }}>
          <RadialProgress
            value={calories.value}
            goal={calories.goal}
            color="var(--accent)"
            displayValue={Number(calories.value || 0).toLocaleString()}
          />
          <RingLabel icon="local_fire_department" color="var(--accent)">Calories</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-2.5 rounded-[20px] py-4 sm:py-5 px-2" style={{ background: 'color-mix(in srgb, #60a5fa 7%, transparent)' }}>
          <RadialProgress
            value={steps.value}
            goal={steps.goal}
            color="#60a5fa"
            displayValue={Number(steps.value || 0).toLocaleString()}
          />
          <RingLabel icon="footprint" color="#60a5fa">Steps</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-2.5 rounded-[20px] py-4 sm:py-5 px-2" style={{ background: 'color-mix(in srgb, #f2c448 7%, transparent)' }}>
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
          className="flex-1 bg-[var(--accent)] text-[#131313] text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          Change Program
        </button>
        <button
          type="button"
          onClick={onSeeMore}
          className="flex-1 bg-transparent text-[var(--text-secondary)] text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-xl border border-[var(--border-medium)] hover:bg-[var(--bg-hover)] active:scale-[0.98] transition-all cursor-pointer"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default ProgramSummaryCard;