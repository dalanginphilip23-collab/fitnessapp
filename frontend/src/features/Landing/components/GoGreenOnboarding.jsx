import { useState, useRef, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const SLIDES = [
  {
    icon: null,
    title: 'VITALIS',
    subtitle: 'Fitness OS',
    desc: null,
    cta: 'Tap or swipe to continue',
    isSplash: true,
  },
  {
    icon: 'pulse_alert',
    title: 'Welcome',
    subtitle: "WE'RE GLAD THAT YOU ARE HERE",
    desc: 'Clinical-grade biometrics, coaching & nutrition — in your pocket.',
    cta: 'Lets get started',
  },
  {
    icon: 'bolt',
    title: 'Discover Your Type\nOf Training',
    subtitle: 'ADAPTIVE COACHING',
    desc: 'Tips N Tricks to grow a healthy performance — protocols that shift with your recovery.',
    cta: 'Continue',
  },
  {
    icon: 'psychiatry',
    title: 'Connect With Other\nAthletes',
    subtitle: 'JOIN A COMMUNITY',
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
            active === i
              ? 'w-5 bg-[#0A1000]'
              : 'w-1.5 bg-[#0A1000]/30 hover:bg-[#0A1000]/50'
          }`}
        />
      ))}
    </div>
  );
}

function SlideIcon({ icon }) {
  if (!icon) {
    return (
      <img
        src="/pwa-192x192.png"
        alt="Vitalis logo"
        className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/20"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-2xl bg-[#0A1000]/10 border border-[#0A1000]/15 flex items-center justify-center">
      <span className="material-symbols-outlined text-[36px] text-[#0A1000]">{icon}</span>
    </div>
  );
}

export default function GoGreenOnboarding({ onComplete, onSkip, onLogin }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const prefersReducedMotion = usePrefersReducedMotion();
  const touchStart = useRef(null);
  const total = SLIDES.length;

  const goNext = useCallback(() => { setDirection(1); setIndex((i) => Math.min(i + 1, total - 1)); }, [total]);
  const goPrev = useCallback(() => { setDirection(-1); setIndex((i) => Math.max(i - 1, 0)); }, []);
  const goTo = useCallback((i) => { setDirection(i > index ? 1 : -1); setIndex(i); }, [index]);

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

  const slide = SLIDES[index];

  return (
    <div
      className="h-[100dvh] w-screen flex flex-col relative overflow-hidden selection:bg-[var(--accent)] selection:text-black"
      style={{ background: 'var(--accent)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button — hidden on splash */}
      {!slide.isSplash && (
        <div className="relative z-10 w-full flex justify-end px-6 pt-6 h-8 shrink-0">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] font-bold tracking-[0.10em] uppercase text-[#0A1000]/60 hover:text-[#0A1000] bg-transparent border-none cursor-pointer transition-colors"
          >
            SKIP
          </button>
        </div>
      )}

      {/* Slide content */}
      <div className="relative z-10 flex-1 w-full overflow-hidden flex flex-col">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <Motion.div
            key={index}
            custom={direction}
            variants={{
              enter: (dir) => ({ x: dir > 0 ? 280 : -280, opacity: 0, scale: 0.98 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (dir) => ({ x: dir > 0 ? -280 : 280, opacity: 0, scale: 0.98 }),
            }}
            initial={prefersReducedMotion ? false : 'enter'}
            animate="center"
            exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
            transition={{ x: { type: 'spring', stiffness: 340, damping: 32 }, opacity: { duration: 0.22 }, scale: { duration: 0.22 } }}
            className="flex-1 flex flex-col items-center justify-center text-center px-8 will-change-transform"
            drag={!prefersReducedMotion ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.22}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const threshold = 60;
              const velocity = info.velocity.x;
              if (info.offset.x < -threshold || velocity < -400) goNext();
              else if (info.offset.x > threshold || velocity > 400) goPrev();
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <SlideIcon icon={slide.icon} />

              <h2
                className="text-[22px] sm:text-[24px] font-black leading-tight text-[#0A1000] whitespace-pre-line"
                style={{ letterSpacing: slide.isSplash ? '0.22em' : '-0.01em' }}
              >
                {slide.title}
              </h2>

              <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase text-[#0A1000]/60 leading-[1.4]">
                {slide.subtitle}
              </p>

              {slide.desc && (
                <p className="text-[13px] leading-relaxed text-[#0A1000]/70 mt-1 max-w-[280px]">
                  {slide.desc}
                </p>
              )}
            </div>
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom area: CTA + Dots */}
      <div className="relative z-10 shrink-0 flex flex-col items-center gap-3 pb-8 pt-4 px-8">
        {!slide.isSplash ? (
          <button
            type="button"
            onClick={handleCTA}
            className="w-full h-12 rounded-full font-black text-[12px] tracking-[0.10em] uppercase transition-all active:scale-[0.98] shadow-lg border-none cursor-pointer"
            style={{
              background: '#0A1000',
              color: 'var(--accent)',
            }}
          >
            {slide.cta}
          </button>
        ) : (
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#0A1000]/60">
            {slide.cta}
          </p>
        )}

        {slide.ctaSecondary && onLogin && (
          <button
            type="button"
            onClick={onLogin}
            className="text-[12px] font-semibold text-[#0A1000]/60 hover:text-[#0A1000] bg-transparent border-none cursor-pointer transition-colors"
          >
            I already have an account
          </button>
        )}

        <Dots total={total} active={index} onDot={goTo} />
      </div>
    </div>
  );
}
