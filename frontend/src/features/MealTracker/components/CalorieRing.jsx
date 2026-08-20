import Icon from "../../../components/ui/Icon";

// Circular calorie-progress ring. Pure presentation — takes the already-
// computed consumed/goal numbers and draws them, nothing more.
export default function CalorieRing({ consumed, goal, size = 168, strokeWidth = 14 }) {
  const radius        = (size - strokeWidth) / 2;
  const circumference  = 2 * Math.PI * radius;
  const pct            = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const offset          = circumference * (1 - pct);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-hover)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="var(--accent)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center px-4">
        <div className="w-8 h-8 rounded-full bg-(--accent-bg) flex items-center justify-center mb-1">
          <Icon name="local_fire_department" className="text-(--accent) text-base" fill={1} />
        </div>
        <span className="text-2xl sm:text-3xl font-black text-(--text-primary) leading-none">{Math.round(consumed).toLocaleString()}</span>
        <span className="text-[10px] text-(--text-muted) leading-tight">kcal consumed</span>
        <span className="text-[11px] font-bold text-(--accent) mt-0.5">{Math.round(pct * 100)}% of goal</span>
      </div>
    </div>
  );
}