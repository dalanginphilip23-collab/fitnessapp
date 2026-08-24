import { useState, useRef, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const SLIDES = [
  {
    variant: 'solid',
    title: 'VITALIS',
    subtitle: 'Fitness OS',
    art: 'solid',
  },
  {
    variant: 'card',
    icon: 'pulse_alert',
    title: 'Welcome',
    subtitle: "we're glad that you are here",
    desc: 'Clinical-grade biometrics, coaching & nutrition — in your pocket.',
    cta: 'Lets get started',
  },
  {
    variant: 'card',
    icon: 'bolt',
    title: 'Discover Your Type\nOf Training',
    subtitle: 'Adaptive Coaching',
    desc: 'Tips N Tricks to grow a healthy performance — protocols that shift with your recovery.',
    cta: 'Continue',
  },
  {
    variant: 'card',
    icon: 'psychiatry',
    title: 'Connect With Other\nAthletes',
    subtitle: 'Join A Community',
    desc: 'Activity feed, shared routes & Vault Privacy — end-to-end encrypted.',
    cta: 'Create Account',
    ctaSecondary: true,
  },
];

function Dots({ total, active, onDot }) {
  return (
    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Onboarding steps">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={active === i}
          aria-label={`Go to slide ${i + 1} of ${total}`}
          onClick={() => onDot(i)}
          className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer p-0 ${
            active === i ? 'w-5 bg-[var(--accent)]' : 'w-1.5 bg-[var(--border-medium)] hover:bg-[var(--border-heavy)]'
          }`}
        />
      ))}
    </div>
  );
}

function SolidSplash({ onNext }) {
  return (
    <div
      className="w-full h-full rounded-[28px] flex flex-col items-center justify-center p-8 relative overflow-hidden cursor-pointer select-none"
      style={{ background: 'var(--accent)' }}
      onClick={onNext}
      role="button"
      tabIndex={0}
      aria-label="Continue onboarding"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNext()}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
        <span className="text-[#0A1000] text-[22px] font-black tracking-[0.22em] leading-none">VITALIS</span>
        <span className="text-[#0A1000]/70 text-[10px] font-bold tracking-[0.28em] uppercase">Fitness OS</span>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-white/90" />
    </div>
  );
}

function PlantArt({ icon }) {
  // Simple icon-centric art like GoGreen plant illustration
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-[var(--accent)]">{icon}</span>
      </div>
      {/* subtle root line like plant */}
      <div className="mt-2 w-12 h-px bg-[var(--border-light)] rounded-full opacity-60" />
    </div>
  );
}

export default function GoGreenOnboarding({ onComplete, onSkip, onLogin }) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const touchStart = useRef(null);
  const total = SLIDES.length;

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const goTo = useCallback((i) => setIndex(i), []);

  // Keyboard arrows
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev]);

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (dx < -50) goNext();
    if (dx > 50) goPrev();
    touchStart.current = null;
  };

  const handleCTA = () => {
    if (index < total - 1) goNext();
    else onComplete?.();
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <div className="min-h-[100dvh] w-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden selection:bg-[var(--accent)] selection:text-black">
      {/* subtle mesh like Landing */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, var(--accent) 0%, transparent 55%)', opacity: 0.06 }} />
      </div>

      {/* Top Skip — hidden on solid splash */}
      <div className="relative z-10 w-full max-w-[360px] flex justify-end h-6 shrink-0">
        {index > 0 && index < total - 1 && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] font-bold tracking-[0.10em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer transition-colors"
          >
            Skip
          </button>
        )}
        {index === total - 1 && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] font-bold tracking-[0.10em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[360px] h-[560px] sm:h-[600px] max-h-[74dvh] rounded-[28px] bg-[var(--bg-secondary)] border border-[var(--border-light)] shadow-xl overflow-hidden flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Onboarding slide ${index + 1} of ${total}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={index}
            initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col p-6 sm:p-7"
            drag={!prefersReducedMotion ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) goNext();
              if (info.offset.x > 60) goPrev();
            }}
          >
            {SLIDES[index].variant === 'solid' ? (
              <SolidSplash onNext={goNext} />
            ) : (
              <>
                {/* Art top */}
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 pt-2">
                  <PlantArt icon={SLIDES[index].icon} />
                  <div className="flex flex-col items-center gap-2 max-w-[260px]">
                    <h2
                      className="text-[22px] sm:text-[24px] font-black leading-tight text-[var(--text-primary)] whitespace-pre-line"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {SLIDES[index].title}
                    </h2>
                    <p className="text-[12px] font-bold tracking-[0.08em] uppercase text-[var(--accent)] leading-[1.4]">
                      {SLIDES[index].subtitle}
                    </p>
                    <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] mt-1">
                      {SLIDES[index].desc}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="shrink-0 flex flex-col items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCTA}
                    className="w-full h-11 rounded-full font-black text-[12px] tracking-[0.10em] uppercase transition-all active:scale-[0.98] shadow-lg border-none cursor-pointer"
                    style={{
                      background: 'var(--accent)',
                      color: '#0A1000',
                      boxShadow: '0 8px 24px rgba(139,195,74,0.28)',
                    }}
                  >
                    {SLIDES[index].cta}
                  </button>
                  {SLIDES[index].ctaSecondary && onLogin && (
                    <button
                      type="button"
                      onClick={onLogin}
                      className="text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer transition-colors"
                    >
                      I already have an account
                    </button>
                  )}
                  {index !== total - 1 && (
                    <div className="h-5" />
                  )}
                </div>
              </>
            )}
          </Motion.div>
        </AnimatePresence>

        {/* Dots + indicator — hidden on solid? show like image */}
        <div className="shrink-0 flex flex-col items-center gap-3 pb-5 pt-2">
          <Dots total={total} active={index} onDot={goTo} />
          <div className="w-32 h-1 rounded-full bg-[var(--text-muted)] opacity-40" />
        </div>
      </div>

      {/* Tap hint for splash */}
      {index === 0 && (
        <p className="relative z-10 mt-3 text-[10px] tracking-[0.12em] uppercase font-semibold text-[var(--text-muted)]">Tap or swipe to continue</p>
      )}
    </div>
  );
}
