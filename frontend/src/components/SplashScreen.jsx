import Icon from './Icon';

const SplashScreen = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-(--bg-primary) animate-fade-in" role="status" aria-live="polite" aria-label="Loading Vitalis">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-(--accent) flex items-center justify-center rounded-xl shrink-0">
        <Icon name="pulse_alert" fill={1} weight={400} className="text-[#161f00] text-[22px]" />
      </div>
      <span className="font-['Manrope'] font-black tracking-[0.2em] text-[16px] text-(--accent)">VITALIS</span>
    </div>
    <div className="w-7 h-7 rounded-full border-[3px] border-(--accent-border) animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
    <span className="sr-only">Loading, please wait...</span>
  </div>
);

export default SplashScreen;