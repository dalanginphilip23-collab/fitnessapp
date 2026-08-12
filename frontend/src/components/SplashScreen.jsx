// Vitalis logo mark: a barbell whose center bar is drawn as a heartbeat
// pulse line — reads as both "gym" and "vitals" at a glance.
const LogoMark = () => (
  <div className="w-24 h-24 sm:w-28 sm:h-28 animate-breathe">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="200" height="200" rx="46" fill="var(--accent)" fillOpacity="0.08" />
      <rect x="28" y="68" width="20" height="64" rx="5" fill="var(--accent)" />
      <rect x="152" y="68" width="20" height="64" rx="5" fill="var(--accent)" />
      <rect x="48" y="84" width="10" height="32" rx="2" fill="var(--accent)" />
      <rect x="142" y="84" width="10" height="32" rx="2" fill="var(--accent)" />
      <path
        d="M58,100 L82,100 L92,72 L102,128 L112,100 L142,100"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 6px var(--accent))' }}
      />
    </svg>
  </div>
);

const SplashScreen = () => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-(--bg-primary) animate-fade-in"
    role="status"
    aria-live="polite"
    aria-label="Loading Vitalis"
  >
    <LogoMark />

    {/* Brand name + loading text */}
    <div className="flex flex-col items-center gap-1">
      <span className="font-['Manrope'] font-black tracking-[0.3em] text-lg text-(--accent)">
        VITALIS
      </span>
      <span className="text-[10px] text-(--text-muted) tracking-[0.25em] uppercase font-semibold animate-pulse">
        Loading
      </span>
    </div>
  </div>
);

export default SplashScreen;
