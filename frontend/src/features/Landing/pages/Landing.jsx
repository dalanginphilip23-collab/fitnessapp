import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import useCanHover from '../hooks/useCanHover';
import useLiveStats from '../hooks/useLiveStats';
import GoGreenOnboarding from '../components/GoGreenOnboarding';
import InstallButton from '../components/InstallButton';
import Reveal from '../components/Reveal';
import logo from '../../../assets/logo.png';
import { formatCompact, HERO_AVATAR_ALPHAS, FEATURES, ABOUT_MISSION_VISION, MARQUEE_LOOP } from '../constants';

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

const HOW_IT_WORKS = [
  { icon: 'person_add', step: '01', title: 'Create your account', desc: 'Sign up free in seconds. No credit card required — your profile, goals, and privacy stay yours.' },
  { icon: 'fitness_center', step: '02', title: 'Track training & meals', desc: 'Log workouts, scan meals with Vision Nutrition, and map runs with the Activity Map.' },
  { icon: 'analytics', step: '03', title: 'Get coached by data', desc: 'Adaptive Coaching and the Performance Lab turn biometrics into your next best session.' },
];

const PWA_PERKS = [
  { icon: 'bolt', title: 'Fast & lightweight', desc: 'Installs in seconds, updates automatically — no app store needed.' },
  { icon: 'wifi_off', title: 'Works offline', desc: 'Core screens stay available thanks to the offline-first service worker.' },
  { icon: 'phone_iphone', title: 'Feels native', desc: 'Fullscreen standalone display with home-screen icon on Android, iOS & desktop.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const canHover = useCanHover();
  const liveStats = useLiveStats();
  const userCount = `${formatCompact(liveStats.users)}+`;
  const workoutCount = formatCompact(liveStats.workouts || 120000);
  const dataCount = formatCompact(liveStats.dataPoints);

  const goRegister = useCallback(() => navigate('/register'), [navigate]);
  const goLogin = useCallback(() => navigate('/login'), [navigate]);
  const [dismissed, setDismissed] = useState(false);
  const handleOnboardComplete = useCallback(() => { setDismissed(true); navigate('/register'); }, [navigate]);
  const handleOnboardSkip = useCallback(() => { setDismissed(true); }, []);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 && !canHover : false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768 && !window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [canHover]);

  // Phone = always show swipe, Desktop = always hide (no persistent seen)
  const showOnboarding = isMobile && !dismissed;

  const ease = [0.22, 1, 0.36, 1];

  if (showOnboarding) {
    return <GoGreenOnboarding onComplete={handleOnboardComplete} onSkip={handleOnboardSkip} onLogin={goLogin} />;
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden relative selection:bg-[var(--accent)] selection:text-black">
      {/* Mesh / glow — subtle app gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.06]" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, var(--accent) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ background: 'radial-gradient(ellipse 70% 60% at 85% 100%, #FFB74D 0%, transparent 60%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] opacity-20" style={{ background: 'var(--accent)' }} />
      </div>

      {/* Top brand bar — sticky so Download is always reachable */}
      <header className="sticky top-0 z-20 w-full bg-[color-mix(in_srgb,var(--bg-primary)_88%,transparent)] backdrop-blur-md border-b border-[var(--border-light)]">
        <div className="w-full md:max-w-[1100px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Vitalis logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="bebas text-[18px] tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>VITALIS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[var(--text-muted)]" aria-label="Sections">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How it works</a>
            <a href="#download" className="hover:text-[var(--text-primary)] transition-colors">Download</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <a
              href="#download"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.10em] uppercase px-4 py-2.5 rounded-full transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--accent)', fontFamily: 'Poppins, sans-serif' }}
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Get app
            </a>
          </div>
        </div>
      </header>

      {/* Hero — desktop: two-column, mobile: stacked */}
      <main className="relative z-10 flex-1 w-full md:max-w-[1100px] mx-auto px-6 md:px-8 flex flex-col items-center text-center md:text-left pt-10 sm:pt-14 pb-4">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between md:gap-16 items-center">
          <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease }}
              className="mt-5 flex flex-col items-center md:items-start gap-1"
            >
              <span className="text-[12px] font-black tracking-[0.20em] uppercase leading-[1.4]" style={{ color: 'var(--accent)', fontFamily: 'Poppins, sans-serif' }}>
                VITALIS
              </span>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-[1.4]" style={{ color: 'var(--text-muted)' }}>
                Human Performance OS
              </span>
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="mt-8 bebas leading-none"
              style={{ fontSize: 'clamp(38px, 8.5vw, 56px)', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: '0.95' }}
            >
              BEYOND
              <br />
              <span className="italic font-light" style={{ color: 'var(--text-muted)' }}>FITNESS.</span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease }}
              className="mt-4 text-[14px] leading-relaxed max-w-[360px]"
              style={{ color: 'var(--text-secondary)', fontFamily: 'Poppins, sans-serif' }}
            >
              Clinical-grade biometrics, coaching &amp; nutrition — in your pocket. Use it in the browser or install it as an app.
            </motion.p>

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
              <span className="text-[12px] font-medium leading-[1.5]" style={{ color: 'var(--text-muted)' }}>
                Joined by <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{userCount}</span> athletes
              </span>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52, ease }}
              className="mt-8 w-full flex flex-col gap-3 max-w-[380px]"
            >
              <InstallButton label="Download App — It's Free" />
              <button
                type="button"
                onClick={goRegister}
                className="w-full h-[52px] rounded-full font-bold text-[12px] tracking-[0.12em] uppercase border transition-colors hover:bg-[var(--bg-hover)] active:scale-[0.98]"
                style={{ background: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border-medium)' }}
              >
                Continue on web — Get Started
              </button>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                No credit card required • Cancel anytime • Works on Android, iPhone &amp; desktop
              </p>
            </motion.div>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center">
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-[420px] rounded-[32px] bg-[var(--bg-secondary)] border border-[var(--border-light)] p-8 shadow-xl"
            >
              <div className="flex justify-center"><div className="scale-[1.2]"><LogoMark /></div></div>
              <div className="mt-6 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-primary)] p-5 text-left">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--accent)' }}>Today&apos;s readiness</p>
                <p className="bebas mt-1" style={{ fontSize: 44, lineHeight: 1, color: 'var(--text-primary)' }}>92<span style={{ fontSize: 20, color: 'var(--text-muted)' }}> / 100</span></p>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                  <div className="h-full w-[92%] rounded-full" style={{ background: 'var(--accent)' }} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[{ v: workoutCount, l: 'Workouts' }, { v: dataCount, l: 'Data pts' }, { v: userCount, l: 'Athletes' }].map((s) => (
                    <div key={s.l} className="rounded-xl border border-[var(--border-light)] py-2.5 px-1">
                      <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{s.v}</p>
                      <p className="text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4"><InstallButton variant="secondary" label="Install on this device" className="w-full" /></div>
            </motion.div>
          </div>
        </div>

        {/* Feature pills */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="mt-8 flex flex-wrap justify-center gap-2 max-w-[520px]"
        >
          {[
            { icon: 'bolt', label: 'Adaptive Coaching' },
            { icon: 'camera', label: 'Vision Meals' },
            { icon: 'analytics', label: 'Biometrics' },
            { icon: 'map', label: 'Activity Map' },
            { icon: 'shield_lock', label: 'Vault Privacy' },
          ].map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold tracking-[0.06em] uppercase leading-[1.4]"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
            >
              <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--accent)' }}>
                {f.icon}
              </span>
              {f.label}
            </span>
          ))}
        </motion.div>

        {/* Marquee strip — scrolling capability ticker */}
        <div className="w-full mt-14 overflow-hidden select-none" aria-hidden="true">
          <style>{`@keyframes vitalis-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
            @media (prefers-reduced-motion: reduce) { .vitalis-marquee-track { animation: none !important; } }`}</style>
          <div className="vitalis-marquee-track flex w-max items-center gap-10 whitespace-nowrap" style={{ animation: 'vitalis-marquee 30s linear infinite' }}>
            {MARQUEE_LOOP.map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="bebas text-[26px] tracking-wide" style={{ color: 'var(--text-muted)', opacity: 0.75 }}>{item}</span>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
              </span>
            ))}
          </div>
        </div>

        {/* System details — Features */}
        <section id="features" className="w-full mt-20 text-left scroll-mt-24">
          <Reveal>
            <p className="text-[11px] font-black tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>The system</p>
            <h2 className="bebas mt-2" style={{ fontSize: 'clamp(30px, 5vw, 44px)', lineHeight: 1, color: 'var(--text-primary)' }}>
              EVERYTHING YOU NEED TO PERFORM
            </h2>
            <p className="mt-3 text-[14px] max-w-[560px]" style={{ color: 'var(--text-secondary)' }}>
              Vitalis combines training plans, meal tracking, activity mapping, and clinical-grade analytics in one Human Performance OS.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.num} delay={(i % 3) * 0.08}>
                <article className="h-full rounded-2xl border p-5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors hover:-translate-y-1" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-start justify-between">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--accent)' }}>{f.icon}</span>
                    </span>
                    <span className="bebas text-[18px]" style={{ color: 'var(--text-muted)' }}>{f.num}</span>
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="w-full mt-16 text-left scroll-mt-24">
          <Reveal>
            <p className="text-[11px] font-black tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>How it works</p>
            <h2 className="bebas mt-2" style={{ fontSize: 'clamp(30px, 5vw, 44px)', lineHeight: 1, color: 'var(--text-primary)' }}>
              FROM SIGN-UP TO PERSONAL BEST
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            {HOW_IT_WORKS.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <article className="h-full rounded-2xl border p-5 hover:-translate-y-1 transition-transform" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)' }}>
                  <span className="bebas text-[28px]" style={{ color: 'var(--accent)' }}>{s.step}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--text-secondary)' }}>{s.icon}</span>
                    <h3 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Download / Install */}
        <section id="download" className="w-full mt-16 scroll-mt-24 rounded-[28px] border overflow-hidden" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <Reveal>
              <p className="text-[11px] font-black tracking-[0.18em] uppercase" style={{ color: 'var(--accent)' }}>Download</p>
              <h2 className="bebas mt-2" style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 0.95, color: 'var(--text-primary)' }}>
                INSTALL VITALIS<br /><span className="italic font-light" style={{ color: 'var(--text-muted)' }}>LIKE A NATIVE APP.</span>
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed max-w-[420px]" style={{ color: 'var(--text-secondary)' }}>
                Vitalis is a Progressive Web App. Tap Download on Android or desktop to install it instantly. On iPhone, use Safari&apos;s Share menu — no App Store needed.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <InstallButton label="Download App" />
                <button
                  type="button"
                  onClick={goRegister}
                  className="inline-flex items-center justify-center h-[52px] px-7 rounded-full font-bold text-[12px] tracking-[0.12em] uppercase border transition-colors hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--border-medium)' }}
                >
                  Try on web first
                </button>
              </div>
              <ol className="mt-6 space-y-2.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex gap-2.5"><span className="font-bold" style={{ color: 'var(--accent)' }}>1.</span> Android / Chrome / Edge: tap <strong>Download App</strong> and confirm Install.</li>
                <li className="flex gap-2.5"><span className="font-bold" style={{ color: 'var(--accent)' }}>2.</span> iPhone Safari: tap <strong>Share → Add to Home Screen → Add</strong>.</li>
                <li className="flex gap-2.5"><span className="font-bold" style={{ color: 'var(--accent)' }}>3.</span> Open Vitalis from your home screen and sign in.</li>
              </ol>
            </Reveal>
            <div className="grid grid-cols-1 gap-3">
              {PWA_PERKS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="rounded-2xl border p-4 flex gap-3" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)' }}>
                    <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--accent)' }}>{p.icon}</span>
                    </span>
                    <div>
                      <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                      <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
              <Reveal delay={0.24}>
                <div className="rounded-2xl border p-4 text-[12px] leading-relaxed" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                  Already installed? Launch it from your home screen or continue in the browser — your account syncs everywhere.
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section id="about" className="w-full mt-16 grid grid-cols-1 md:grid-cols-2 gap-3 text-left scroll-mt-24">
          {ABOUT_MISSION_VISION.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.1}>
              <article className="h-full rounded-2xl border p-6 hover:-translate-y-1 transition-transform" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-primary)' }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--accent)' }}>{m.icon}</span>
                <h3 className="mt-2 text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.body}</p>
              </article>
            </Reveal>
          ))}
        </section>
      </main>

      {/* Bottom — minimal, safe-area aware */}
      <footer className="relative z-10 w-full md:max-w-[1100px] mx-auto px-6 md:px-8 pb-6 sm:pb-8 pt-8 flex flex-col items-center gap-3 shrink-0">
        <div className="h-px w-full" style={{ background: 'var(--border-light)' }} />
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-medium tracking-wide text-center" style={{ color: 'var(--text-muted)' }}>
            © 2026 Vitalis Labs • Privacy • Terms
          </p>
          <div className="flex items-center gap-4 text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            <a href="#features" className="hover:text-[var(--text-primary)]">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)]">How it works</a>
            <a href="#download" className="hover:text-[var(--text-primary)]">Download</a>
          </div>
        </div>
        <div className="mt-1 w-32 h-1 rounded-full opacity-60 sm:hidden" style={{ background: 'var(--text-muted)' }} />
      </footer>
    </div>
  );
};

export default Landing;
