import Icon from '../../../components/ui/Icon';

function SmallRing({ value, goal, pctLabel, color, track = 'rgba(0,0,0,0.08)' }) {
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
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black" style={{ color }}>{pctLabel ?? `${pct}%`}</span>
    </div>
  );
}

export function CaloriesCard({ calories = { value: 0, goal: 800 }, onClick }) {
  const pct = Math.min(100, Math.round((Number(calories.value)||0)/(calories.goal||800)*100));
  return (
    <button type="button" onClick={onClick} className="flex-1 bg-[#DDE8A0] rounded-[18px] p-4 flex flex-col justify-between text-left border-none cursor-pointer hover:brightness-[0.98] transition-all min-w-0">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[#1A1A17] text-[11px] font-bold"><Icon name="local_fire_department" className="text-[14px]" /> Calories</span>
        <Icon name="chevron_right" className="text-[#1A1A17]/40 text-[14px]" />
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <div className="text-[#1A1A17] font-black text-[20px] leading-none">{Number(calories.value||0).toLocaleString()}</div>
          <div className="text-[#1A1A17]/60 text-[11px] font-bold">Kcal</div>
        </div>
        <SmallRing value={calories.value} goal={calories.goal} pctLabel={`${pct}%`} color="#2d4a0a" track="rgba(0,0,0,0.12)" />
      </div>
    </button>
  );
}

export function WorkoutCard({ sessionLoadMins = { value: 0, goal: 120 }, onClick }) {
  const pct = Math.min(100, Math.round((Number(sessionLoadMins.value)||0)/(sessionLoadMins.goal||120)*100));
  return (
    <button type="button" onClick={onClick} className="flex-1 bg-[#C8B5E0] rounded-[18px] p-4 flex flex-col justify-between text-left border-none cursor-pointer hover:brightness-[0.98] transition-all min-w-0">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[#1A1A17] text-[11px] font-bold"><Icon name="fitness_center" className="text-[14px]" /> Workout</span>
        <Icon name="chevron_right" className="text-[#1A1A17]/40 text-[14px]" />
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <div className="text-[#1A1A17] font-black text-[20px] leading-none">{Number(sessionLoadMins.value||0)}</div>
          <div className="text-[#1A1A17]/60 text-[11px] font-bold">Min</div>
        </div>
        <SmallRing value={sessionLoadMins.value} goal={sessionLoadMins.goal} pctLabel={`${pct}%`} color="#3a1f6b" track="rgba(58,31,107,0.18)" />
      </div>
    </button>
  );
}
