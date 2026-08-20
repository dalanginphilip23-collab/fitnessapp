import Icon from '../../../components/ui/Icon';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const ReadinessRing = ({ pct = 0, size = 92, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(pct, 0), 100) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon name="monitor_heart" className="text-white text-[30px]" fill={1} />
      </div>
    </div>
  );
};

const Hero = ({ name = 'Athlete', avatar, readiness, onCoachInsight }) => {
  const pct     = readiness?.pct ?? 0;
  const label   = readiness?.label ?? 'No Data Yet';
  const message = readiness?.message ?? 'Log your sleep to see your daily readiness.';

  return (
    <div className="mb-6">
      {/* Greeting row */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] mb-1">
            {getGreeting()},
          </p>
          <h1 className="font-['Manrope'] text-[24px] sm:text-[28px] font-bold text-[var(--text-primary)] leading-tight truncate flex items-center gap-2">
            {name} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] font-medium mt-0.5">Let's make today healthier.</p>
        </div>

        <div className="shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[var(--accent-border)] ring-4 ring-[var(--accent)]/10"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-bg)] border-2 border-[var(--accent-border)] ring-4 ring-[var(--accent)]/10 flex items-center justify-center text-lg font-black text-[var(--accent)]">
              {name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
        </div>
      </div>

      {/* Daily Readiness card */}
      <div className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 shadow-lg bg-gradient-to-br from-[#3f7a1a] to-[#12240a]">
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">
              Daily Readiness
            </p>
            <div className="flex items-baseline gap-1">
              <span className="stat-digital text-[46px] sm:text-[52px] font-extrabold text-white leading-none tracking-tight">
                {pct}
              </span>
              <span className="text-[20px] font-bold text-white/80">%</span>
            </div>
            <p className="text-[14px] font-bold text-white mt-2">{label}!</p>
            <p className="text-[12px] text-white/70 mt-0.5">{message}</p>

            <button
              type="button"
              onClick={onCoachInsight}
              className="mt-4 inline-flex items-center gap-1.5 bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold px-3.5 py-2 rounded-full border-none cursor-pointer transition-colors"
            >
              <Icon name="auto_awesome" className="text-[14px]" fill={1} />
              AI Coach Insight
              <Icon name="chevron_right" className="text-[14px]" />
            </button>
          </div>

          <ReadinessRing pct={pct} />
        </div>
      </div>
    </div>
  );
};

export default Hero;