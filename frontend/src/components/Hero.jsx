import Icon from './Icon';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Decorative silhouette — rolling hills, a couple of trees, and a runner.
// Purely presentational (no data), kept as inline SVG so it themes with
// the card's white-on-green palette without shipping an image asset.
const RunnerIllustration = () => (
  <svg
    viewBox="0 0 300 160"
    className="absolute right-0 bottom-0 h-full w-auto opacity-90 pointer-events-none select-none"
    aria-hidden="true"
  >
    <path d="M0 130 Q60 90 120 120 T260 110 L300 130 L300 160 L0 160 Z" fill="rgba(255,255,255,0.10)" />
    <path d="M40 140 Q100 100 170 135 T300 125 L300 160 L0 160 Z" fill="rgba(255,255,255,0.14)" />
    <g fill="rgba(255,255,255,0.16)">
      <rect x="250" y="95" width="4" height="35" rx="2" />
      <circle cx="252" cy="88" r="14" />
      <rect x="20" y="105" width="3" height="28" rx="1.5" />
      <circle cx="21.5" cy="100" r="10" />
    </g>
    <g transform="translate(150,60)" fill="rgba(255,255,255,0.55)">
      <circle cx="18" cy="0" r="8" />
      <path d="M14 8 L26 8 L30 30 L22 30 L19 16 L8 20 L-2 55 L-10 52 L2 12 Z" />
      <path d="M22 30 L34 34 L46 22 L52 28 L36 46 L18 40 Z" />
      <path d="M8 20 L-6 12 L-14 -2 L-8 -8 L2 6 L16 12 Z" />
    </g>
  </svg>
);

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

const Hero = ({ name = 'Athlete', readiness, onCoachInsight }) => {
  const pct     = readiness?.pct ?? 0;
  const label   = readiness?.label ?? 'No Data Yet';
  const message = readiness?.message ?? 'Log your sleep to see your daily readiness.';

  return (
    <div className="relative overflow-hidden rounded-[24px] p-6 sm:p-7 mb-6 shadow-lg bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_55%,#0f2d10)]">
      <RunnerIllustration />

      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80 mb-1">
            {getGreeting()},
          </p>
          <h1 className="font-['Manrope'] text-[24px] sm:text-[28px] font-bold text-white leading-tight truncate flex items-center gap-2">
            {name} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-[13px] text-white/75 font-medium mt-0.5">Let's make today healthier.</p>
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-4 mt-8">
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
  );
};

export default Hero;
