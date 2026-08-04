// One heartbeat period (flat → small bump → sharp spike → small bump → flat),
// drawn twice back-to-back so translating by exactly one period (240px,
// matching the ecg-sweep keyframes) loops seamlessly.
const ECG_PATH =
  'M0,60 L40,60 L55,40 L65,60 L80,15 L90,105 L100,60 L115,40 L125,60 L200,60 ' +
  'L240,60 L255,40 L265,60 L280,15 L290,105 L300,60 L315,40 L325,60 L400,60';

const EcgLine = () => (
  <div
    className="relative w-56 h-20 overflow-hidden"
    style={{
      WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
      maskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
    }}
  >
    {/* Faint baseline so the trace reads as a monitor readout, not a floating line */}
    <div className="absolute left-0 right-0 top-1/2 h-px bg-(--border-light)" />

    <svg
      width="480"
      height="96"
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      className="absolute left-0 top-0 animate-ecg-sweep"
      style={{ filter: 'drop-shadow(0 0 6px var(--accent))' }}
    >
      <path
        d={ECG_PATH}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
