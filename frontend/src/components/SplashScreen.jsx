// A single heartbeat trace (flat → small bump → sharp spike → small bump →
// flat), repeated twice so the visible line shows two beats.
const ECG_PATH =
  'M0,60 L40,60 L55,40 L65,60 L80,15 L90,105 L100,60 L115,40 L125,60 L200,60 ' +
  'L240,60 L255,40 L265,60 L280,15 L290,105 L300,60 L315,40 L325,60 L400,60';

const EcgLine = () => (
  <div className="relative w-56 h-20">
    <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
      <defs>
        {/* Fades from invisible (trailing edge) to fully opaque (leading edge) —
            gives the moving highlight a comet-like fading tail. */}
        <linearGradient id="ecgTrailFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#fff" stopOpacity="0" />
          <stop offset="75%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="ecgTrailMask">
          <rect x="0" y="0" width="140" height="120" fill="url(#ecgTrailFade)" className="animate-ecg-scan" />
        </mask>
      </defs>

      {/* Dim baseline trace, always visible */}
      <path
        d={ECG_PATH}
        fill="none"
        stroke="var(--border-medium)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bright accent trace, only shown where the scanning mask reveals it */}
      <path
        d={ECG_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        mask="url(#ecgTrailMask)"
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
    <EcgLine />

    {/* Brand name + loading text */}
    <div className="flex flex-col items-center gap-1 -mt-4">
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
