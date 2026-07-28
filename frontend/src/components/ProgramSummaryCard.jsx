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
    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${color}20` }}>
      <Icon name={icon} className="text-[10px]" style={{ color }} />
    </div>
    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-(--text-muted)">
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
    <div className="bg-(--bg-tertiary) border border-(--border-light) rounded-[20px] p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-(--accent-bg) flex items-center justify-center">
            <Icon name="fitness_center" className="text-(--accent) text-[14px]" />
          </div>
          <div>
            <span className="text-[12px] font-bold text-(--text-secondary)">{goalLabel}</span>
            <p className="text-[9px] text-(--text-muted) font-medium uppercase tracking-wider">{weekLabel}</p>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-(--text-muted) hover:text-(--text-secondary) transition-colors bg-transparent border-none cursor-pointer"
        >
          {weekLabel}
          <Icon name="expand_more" className="text-[14px]" />
        </button>
      </div>

      <div className="flex items-start justify-around py-2">
        <div className="flex flex-col items-center gap-3">
          <RadialProgress
            value={calories.value}
            goal={calories.goal}
            color="var(--orange)"
            displayValue={Number(calories.value || 0).toLocaleString()}
          />
          <RingLabel icon="local_fire_department" color="var(--orange)">Calories</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-3">
          <RadialProgress
            value={steps.value}
            goal={steps.goal}
            color="var(--blue)"
            displayValue={Number(steps.value || 0).toLocaleString()}
          />
          <RingLabel icon="footprint" color="var(--blue)">Steps</RingLabel>
        </div>

        <div className="flex flex-col items-center gap-3">
          <RadialProgress
            value={sessionLoadMins.value}
            goal={sessionLoadMins.goal}
            color="var(--purple)"
            displayValue={formatSessionLoad(sessionLoadMins.value)}
          />
          <RingLabel icon="timer" color="var(--purple)">Session Load</RingLabel>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onChangeProgram}
          className="flex-1 bg-(--accent) text-[#0a0a0a] text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border-none shadow-lg shadow-(--accent)/20"
        >
          Change Program
        </button>
        <button
          type="button"
          onClick={onSeeMore}
          className="flex-1 bg-transparent text-(--text-secondary) text-[11px] font-black uppercase tracking-[0.14em] py-3.5 rounded-xl border border-(--border-medium) hover:bg-(--bg-hover) hover:border-(--accent)/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default ProgramSummaryCard;