import Icon from '../../../components/ui/Icon';

function SmallRing({ value, goal, pctLabel, color, track }) {
  const size = 36;
  const sw = 4;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.round((Number(value)||0)/(goal||1)*100));
  const off = circ - (pct/100)*circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black" style={{ color }}>{pctLabel ?? `${pct}%`}</span>
    </div>
  );
}

export function CaloriesCard({ calories = { value: 0, goal: 800 }, onClick }) {
  const pct = Math.min(100, Math.round((Number(calories.value)||0)/(calories.goal||800)*100));
  return (
    <button type="button" onClick={onClick} className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[18px] p-4 flex flex-col justify-between text-left cursor-pointer hover:border-[var(--accent-border)] hover:shadow-[0_4px_16px_var(--accent-bg)] hover:-translate-y-0.5 transition-all min-w-0">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[var(--text-primary)] text-[12px] font-bold"><span className="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center"><Icon name="local_fire_department" className="text-[14px] text-[var(--accent)]" /></span> Calories</span>
        <Icon name="chevron_right" className="text-[var(--text-muted)] text-[14px]" />
      </div>
      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="text-[var(--text-primary)] font-black text-[20px] leading-none">{Number(calories.value||0).toLocaleString()}</div>
          <div className="text-[var(--text-muted)] text-[11px] font-bold">Kcal</div>
        </div>
        <SmallRing value={calories.value} goal={calories.goal} pctLabel={`${pct}%`} color="var(--accent)" track="var(--border-light)" />
      </div>
    </button>
  );
}

export function WorkoutCard({ sessionLoadMins = { value: 0, goal: 120 }, onClick }) {
  const pct = Math.min(100, Math.round((Number(sessionLoadMins.value)||0)/(sessionLoadMins.goal||120)*100));
  return (
    <button type="button" onClick={onClick} className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[18px] p-4 flex flex-col justify-between text-left cursor-pointer hover:border-[var(--accent-warm-border)] hover:shadow-[0_4px_16px_var(--accent-warm-bg)] hover:-translate-y-0.5 transition-all min-w-0">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[var(--text-primary)] text-[12px] font-bold"><span className="w-7 h-7 rounded-lg bg-[var(--accent-warm-bg)] border border-[var(--accent-warm-border)] flex items-center justify-center"><Icon name="fitness_center" className="text-[14px] text-[var(--accent-warm)]" /></span> Workout</span>
        <Icon name="chevron_right" className="text-[var(--text-muted)] text-[14px]" />
      </div>
      <div className="flex items-end justify-between mt-4">
        <div>
          <div className="text-[var(--text-primary)] font-black text-[20px] leading-none">{Number(sessionLoadMins.value||0)}</div>
          <div className="text-[var(--text-muted)] text-[11px] font-bold">Min</div>
        </div>
        <SmallRing value={sessionLoadMins.value} goal={sessionLoadMins.goal} pctLabel={`${pct}%`} color="var(--accent-warm)" track="var(--border-light)" />
      </div>
    </button>
  );
}
