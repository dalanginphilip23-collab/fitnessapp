import Logo from './Logo';

const SplashScreen = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-(--bg-primary) animate-fade-in" role="status" aria-live="polite" aria-label="Loading Vitalis">
    <Logo size="md" showText />
    <div className="w-7 h-7 rounded-full border-[3px] border-(--accent-border) animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
    <span className="sr-only">Loading, please wait...</span>
  </div>
);

export default SplashScreen;