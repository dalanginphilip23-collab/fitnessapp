import Icon from './Icon';

const SplashScreen = () => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-(--bg-primary) animate-fade-in"
    role="status"
    aria-live="polite"
    aria-label="Loading Vitalis"
  >
    {/* Pulsing logo with heartbeat rings */}
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      <div className="absolute w-28 h-28 rounded-full bg-(--accent)/5 animate-ping" style={{ animationDuration: '1.5s' }} />
      <div className="absolute w-24 h-24 rounded-full bg-(--accent)/10 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
      <div className="absolute w-20 h-20 rounded-full bg-(--accent)/15 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.4s' }} />

      {/* Logo mark */}
      <div className="relative w-14 h-14 bg-(--accent) flex items-center justify-center rounded-2xl shadow-lg shadow-(--accent)/25">
        <Icon name="pulse_alert" fill={1} weight={400} className="text-[#161f00] text-[30px]" />
      </div>
    </div>

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
