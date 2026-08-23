/* eslint-disable no-unused-vars */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useLiveStats from '../hooks/useLiveStats';
import { formatCompact, HERO_AVATAR_ALPHAS } from '../constants';

// Splash mark — same barbell+heartbeat as SplashScreen, scaled for landing
const LogoMark = () => (
  <div className="w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] animate-breathe">
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

const Landing = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const liveStats = useLiveStats();
  const userCount = `${formatCompact(liveStats.users)}+`;

  const goRegister = useCallback(() => navigate('/register'), [navigate]);
  const goLogin = useCallback(() => navigate('/login'), [navigate]);

  const ease = [0.22, 1, 0.36, 1];

  return (
    <div className="min-h-[100dvh] w-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden relative selection:bg-[var(--accent)] selection:text-black">
      {/* Mesh / glow — subtle app gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, var(--accent) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'radial-gradient(ellipse 70% 60% at 85% 100%, #FFB74D 0%, transparent 60%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--accent)' }} />
      </div>

      {/* Top brand bar — minimal, like native status bar */}
      <header className="relative z-10 w-full max-w-[480px] mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="material-symbols-outlined text-[16px] text-[#0a1000]">pulse_alert</span>
          </div>
          <span className="bebas text-[18px] tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>VITALIS</span>
        </div>
        <button
          type="button"
          onClick={goLogin}
          className="text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-2 rounded-full border transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-light)', fontFamily: 'Poppins, sans-serif' }}
        >
          Sign in
        </button>
      </header>

      {/* Center splash content */}
      <main className="relative z-10 flex-1 w-full max-w-[480px] mx-auto px-6 flex flex-col items-center justify-center text-center py-8 sm:py-10">
        {/* Logo */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
        >
          <LogoMark />
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
          className="mt-5 flex flex-col items-center gap-1"
        >
          <span className="text-[11px] font-black tracking-[0.32em] uppercase" style={{ color: 'var(--accent)', fontFamily: 'Poppins, sans-serif' }}>
            VITALIS
          </span>
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Human Performance OS
          </span>
        </motion.div>

        {/* Headline — app style, not marketing hero */}
        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mt-8 bebas leading-none"
          style={{ fontSize: 'clamp(36px, 10vw, 54px)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
        >
          BEYOND
          <br />
          <span className="italic font-light" style={{ color: 'var(--text-muted)' }}>FITNESS.</span>
        </motion.h1>

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease }}
          className="mt-4 text-[13px] leading-relaxed max-w-[320px]"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Poppins, sans-serif' }}
        >
          Clinical-grade biometrics, coaching & nutrition — in your pocket.
        </motion.p>

        {/* Avatars + social proof — compact app row */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mt-5 flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            {HERO_AVATAR_ALPHAS.map((pct, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
                style={{ borderColor: 'var(--bg-primary)', background: `color-mix(in srgb, var(--accent) ${pct + 20}%, var(--bg-secondary))`, color: 'var(--text-primary)' }}
              >
                •
              </div>
            ))}
          </div>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Joined by <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{userCount}</span> athletes
          </span>
        </motion.div>

        {/* CTAs — stacked, thumb-friendly mobile splash */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52, ease }}
          className="mt-8 w-full flex flex-col gap-3"
        >
          <button
            type="button"
            onClick={goRegister}
            className="w-full h-[52px] rounded-full font-black text-[12px] tracking-[0.14em] uppercase transition-all hover:scale-[1.01] active:scale-[0.98] shadow-lg"
            style={{ background: 'var(--accent)', color: '#0a1000', boxShadow: '0 10px 30px rgba(139,195,74,0.28)' }}
          >
            Get Started — It&apos;s Free
          </button>
          <button
            type="button"
            onClick={goLogin}
            className="w-full h-[52px] rounded-full font-bold text-[12px] tracking-[0.12em] uppercase border transition-colors hover:bg-[var(--bg-hover)] active:scale-[0.98]"
            style={{ background: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}
          >
            I already have an account
          </button>
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            No credit card required • Cancel anytime
          </p>
        </motion.div>

        {/* Tiny feature pills — app onboarding, not landing sections */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="mt-8 flex flex-wrap justify-center gap-2 max-w-[340px]"
        >
          {[
            { icon: 'bolt', label: 'Adaptive Coaching' },
            { icon: 'camera', label: 'Vision Meals' },
            { icon: 'analytics', label: 'Biometrics' },
          ].map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wide uppercase"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
            >
              <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--accent)' }}>
                {f.icon}
              </span>
              {f.label}
            </span>
          ))}
        </motion.div>
      </main>

      {/* Bottom — minimal, safe-area aware */}
      <footer className="relative z-10 w-full max-w-[480px] mx-auto px-6 pb-6 sm:pb-8 pt-4 flex flex-col items-center gap-3 shrink-0">
        <div className="h-px w-full" style={{ background: 'var(--border-light)' }} />
        <p className="text-[10px] font-medium tracking-wide text-center" style={{ color: 'var(--text-muted)' }}>
          © 2026 Vitalis Labs • Privacy • Terms
        </p>
        {/* iOS home indicator mimic */}
        <div className="mt-1 w-32 h-1 rounded-full opacity-60 sm:hidden" style={{ background: 'var(--text-muted)' }} />
      </footer>
    </div>
  );
};

export default Landing;
