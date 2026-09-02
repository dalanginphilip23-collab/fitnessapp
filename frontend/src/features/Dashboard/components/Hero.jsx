import Icon from '../../../components/ui/Icon';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const ReadinessRing = ({ pct = 0, size = 68, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(pct, 0), 100) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={strokeWidth} />
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
        <Icon name="monitor_heart" className="text-white text-[22px]" fill={1} />
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
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] leading-[1.4] text-[var(--text-muted)] mb-1">
            {getGreeting()},
          </p>
          <h1 className="font-['Manrope'] text-[24px] sm:text-[28px] font-bold text-[var(--text-primary)] leading-tight truncate flex items-center gap-2">
            {name} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">Let's make today healthier.</p>
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

      {/* Daily Readiness card — compact: ring moved aside (right) and smaller */}
      <div className="relative overflow-hidden rounded-[24px] p-5 sm:p-6 shadow-lg bg-[#16a34a]" style={{ backgroundImage: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)` }}>
        <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.3),transparent_55%)]" />
        <div className="relative flex flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] leading-[1.4] text-white/80 mb-1">
              Daily Readiness
            </p>
            <div className="flex items-baseline gap-1">
              <span className="stat-digital text-[36px] sm:text-[42px] font-extrabold text-white leading-none tracking-tight">
                {pct}
              </span>
              <span className="text-[16px] font-bold text-white/80">%</span>
            </div>
            <p className="text-[13px] font-bold text-white mt-1.5">{label}!</p>
            <p className="text-[12px] text-white/70 mt-0.5 leading-relaxed line-clamp-2">{message}</p>

            <button
              type="button"
              onClick={onCoachInsight}
              className="mt-4 inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[12px] font-bold px-4 py-2 rounded-full border border-white/30 cursor-pointer transition-colors leading-[1.4]"
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