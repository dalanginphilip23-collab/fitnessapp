import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import ThemeToggle from '../../components/ThemeToggle';

// ─── Constants ────────────────────────────────────────────────────────────────
const GYM_BG_BASE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=70';
const GYM_BG_SRCSET = [640, 1080, 1600, 1920]
  .map((w) => `${GYM_BG_BASE}&w=${w} ${w}w`)
  .join(', ');
const GYM_BG_FALLBACK = `${GYM_BG_BASE}&w=1600`;
const EASE_EXPO = [0.16, 1, 0.3, 1];

// ─── Static data ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'filter_center_focus', title: 'Neural Biometrics',  desc: 'Medical-grade analysis of HRV and neural fatigue through high-frequency AI scanning.', num: '01' },
  { icon: 'bolt',                title: 'Adaptive Coaching',  desc: 'Workout protocols that shift intensity based on your real-time recovery data.',           num: '02' },
  { icon: 'camera',              title: 'Vision Nutrition',   desc: 'Snap a photo. Our vision models calculate macros and micronutrients instantly.',          num: '03' },
  { icon: 'all_inclusive',       title: 'Ecosystem Sync',     desc: 'Seamlessly aggregates data from Apple Watch, Oura, and Garmin platforms.',               num: '04' },
  { icon: 'analytics',           title: 'Performance Lab',    desc: 'Institutional-grade trend reporting that predicts peak performance windows.',             num: '05' },
  { icon: 'shield_lock',         title: 'Vault Privacy',      desc: 'Your biometric data is end-to-end encrypted with zero-knowledge protocols.',             num: '06' },
];

const PRICING = [
  {
    name: 'Foundations', price: 'Free', per: '',
    features: ['Core Biometrics', 'Daily Health Score', 'Community Access'],
    popular: false, planId: null, ctaLabel: 'Browse Free Plans', ctaDest: 'explore',
  },
  {
    name: 'Professional', price: '$9', per: '/mo',
    features: ['Adaptive Coaching', 'Vision Nutrition', 'Deep Analytics', 'Priority Support'],
    popular: true, planId: null, ctaLabel: 'View Pro Plans', ctaDest: 'find',
  },
  {
    name: 'Elite', price: '$19', per: '/mo',
    features: ['1-on-1 AI Strategy', 'Biometric Alerts', 'Full API Access', 'Custom Protocol Lab'],
    popular: false, planId: null, ctaLabel: 'View Elite Plans', ctaDest: 'find',
  },
];

const ABOUT_STATS = [
  { value: '50K+', label: 'Active Athletes' },
  { value: '98%',  label: 'Satisfaction'    },
  { value: '2.1M', label: 'Data Points'     },
  { value: '24/7', label: 'AI Coverage'     },
];

const ABOUT_VALUES = [
  { title: 'Innovation First',  desc: "We push the boundaries of what's possible with AI and biometric technology.", icon: 'rocket_launch' },
  { title: 'Privacy by Design', desc: 'Your data belongs to you. We built security from the ground up.',            icon: 'shield_lock'   },
  { title: 'Scientific Rigor',  desc: 'Every feature is backed by peer-reviewed research and clinical validation.', icon: 'science'       },
  { title: 'Human-Centered',    desc: 'Technology serves people, not the other way around.',                        icon: 'favorite'      },
];

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing',  label: 'Pricing'  },
  { href: '#about',    label: 'About'    },
];

const buildPlansPath = ({ planId = null, tab = 'explore' } = {}) => {
  const params = new URLSearchParams();
  if (planId) params.set('planId', String(planId));
  else        params.set('tab', tab);
  return `/dashboard/plans?${params.toString()}`;
};

// ─── Theme-aware color helpers ────────────────────────────────────────────────
// IMPORTANT: these all return CSS variable / color-mix() expressions, NOT
// resolved hex/rgba strings. That means their *string output never changes*
// when the theme flips — only the underlying CSS variable value (set once,
// on :root, by ThemeContext) changes. So React doesn't need to re-render or
// recompute a single one of these on toggle, and the browser only has to
// recompute the actual affected paint layers — no stylesheet reparse, no
// forced reflow, no animation stutter.
const ink = (alpha) => `rgb(var(--ink-base) / ${alpha})`;
const accentAlpha = (pct) => `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;
const bgAlpha = (pct) => `color-mix(in srgb, var(--bg) ${pct}%, transparent)`;

const THEME = {
  accent: 'var(--accent)',
  bg: 'var(--bg)',
  bgAlt: 'var(--bg-alt)',
  bgFooter: 'var(--bg-footer)',
  bgSecondary: 'var(--bg-secondary)',
  bgMarquee: 'var(--bg-marquee, var(--bg-alt))',
  text: 'var(--text)',
  textStrong: 'var(--text-strong)',
  textSoft: 'var(--text-soft)',
  border: 'var(--border-color)',
  navBg: 'var(--nav-bg)',
  shadow: 'var(--shadow-color)',
};

// ─── One-time static stylesheet ───────────────────────────────────────────────
// This string is created exactly once (module scope) and NEVER touches theme
// state. Every value that used to be interpolated per-theme now reads a CSS
// variable set by ThemeContext, so a theme toggle updates variables (cheap)
// instead of forcing React to replace this whole tag's text (expensive: full
// re-parse + full-document style recalculation = the forced reflow you saw).
const LANDING_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,700;1,9..40,900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); overflow-x: hidden; }
  ::selection { background: var(--selection-bg); color: var(--selection-text); }
  .bebas { font-family: 'Bebas Neue', sans-serif; }
  .dm    { font-family: 'DM Sans', sans-serif; }
  .hero-text { font-family: 'Bebas Neue', sans-serif; font-size: clamp(56px, 18vw, 200px); line-height: 0.88; letter-spacing: -0.01em; }
  .section-num { font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 12vw, 140px); color: var(--section-num-color); line-height: 1; }
  section[id] { scroll-margin-top: 5rem; }
  .hero-min-h { min-height: 100vh; min-height: 100dvh; }
  .grain::before {
    content: ''; position: fixed; inset: -50%; width: 200%; height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: var(--grain-opacity); pointer-events: none; z-index: 9998; animation: grain 0.5s steps(2) infinite;
  }
  @keyframes grain { 0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}20%{transform:translate(3%,2%)}30%{transform:translate(-1%,4%)}40%{transform:translate(4%,-1%)}50%{transform:translate(-3%,3%)}60%{transform:translate(2%,-4%)}70%{transform:translate(-4%,1%)}80%{transform:translate(1%,-2%)}90%{transform:translate(-2%,4%)} }
  .glow-text { text-shadow: 0 0 80px color-mix(in srgb, var(--accent) 30%, transparent); }
  .scanline { background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px); pointer-events: none; }
  @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.2); opacity: 0; } }
  .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
  .animate-marquee { animation: marquee 30s linear infinite; }
  a:focus-visible, button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 4px;
  }
  /* GPU-friendly: theme + motion transitions only ever affect color/background/
     opacity/transform — never width/height/layout — so the compositor can
     handle them without triggering layout at all. */
  body, .bebas, .dm, a, button, [class*="bg-"] {
    transition: background-color 220ms ease, color 220ms ease, border-color 220ms ease;
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .animate-marquee { animation: none !important; }
    .grain::before { animation: none !important; }
    .pulse-ring { animation: none !important; }
    body, .bebas, .dm, a, button, [class*="bg-"] { transition: none !important; }
  }
`;

// ─── Device-capability hooks ──────────────────────────────────────────────────
const useCanHover = () => {
  const [canHover, setCanHover] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handler = (e) => setCanHover(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return canHover;
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
};

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = React.memo(({ name, className = '' }) => (
  <span className={`material-symbols-outlined select-none leading-none ${className}`}>{name}</span>
));

// ─── Horizontal Slider ────────────────────────────────────────────────────────
const HorizontalSlider = ({ items, renderItem, itemWidth = 'w-[80vw] sm:w-[340px]', canHover }) => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const itemWidthRef = useRef(0);
  const total = items.length;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(total - 1, i + 1));

  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current.children[index];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [index]);

  // Measure item width once (and on resize) instead of reading offsetWidth
  // synchronously inside the scroll handler — that was a forced-reflow read
  // firing on every scroll event.
  useEffect(() => {
    const measure = () => {
      itemWidthRef.current = trackRef.current?.children?.[0]?.offsetWidth ?? 0;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [items]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = itemWidthRef.current + 16;
          if (w) setIndex(Math.round(el.scrollLeft / w));
        }}
      >
        {items.map((item, i) => (
          <div key={i} className={`${itemWidth} shrink-0 snap-start`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between mt-5">
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === index ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === index ? THEME.accent : ink(0.2),
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              disabled={index === 0}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ borderColor: ink(0.1), color: ink(0.4) }}
              onMouseEnter={e => { if (canHover && index !== 0) { e.currentTarget.style.borderColor = accentAlpha(40); e.currentTarget.style.color = THEME.accent; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.1); e.currentTarget.style.color = ink(0.4); }}
            >
              <Icon name="chevron_left" className="text-lg" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              disabled={index === total - 1}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ borderColor: ink(0.1), color: ink(0.4) }}
              onMouseEnter={e => { if (canHover && index !== total - 1) { e.currentTarget.style.borderColor = accentAlpha(40); e.currentTarget.style.color = THEME.accent; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.1); e.currentTarget.style.color = ink(0.4); }}
            >
              <Icon name="chevron_right" className="text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Marquee ──────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = ['Neural Biometrics', 'Adaptive Coaching', 'Vision Nutrition', 'Performance Lab', 'Ecosystem Sync', 'Vault Privacy'];
const Marquee = () => (
  <div
    className="relative overflow-hidden py-5 border-y"
    style={{ borderColor: ink(0.05), backgroundColor: THEME.bgMarquee }}
  >
    <div className="flex animate-marquee whitespace-nowrap gap-0">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-6 px-8">
          <span className="text-[11px] font-black uppercase tracking-[0.35em]" style={{ color: ink(0.25) }}>{item}</span>
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: THEME.accent, boxShadow: `0 0 6px ${accentAlpha(60)}` }}
          />
        </span>
      ))}
    </div>
  </div>
);

// ─── Cursor glow ──────────────────────────────────────────────────────────────
const CursorGlow = ({ enabled }) => {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  useEffect(() => {
    if (!enabled) return;
    const move = (e) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mx, my, enabled]);

  if (!enabled) return null;

  return (
    <motion.div className="pointer-events-none fixed z-[9999] top-0 left-0 hidden lg:block" style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}>
      <div className="w-64 h-64 rounded-full blur-[60px]" style={{ backgroundColor: accentAlpha(13) }} />
    </motion.div>
  );
};

// ─── Stat counter ─────────────────────────────────────────────────────────────
const StatCounter = ({ value, label }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center relative">
      <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-8" style={{ backgroundColor: accentAlpha(20) }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none mb-2"
        style={{ fontFamily: "'Bebas Neue', sans-serif", color: THEME.textStrong }}
      >{value}</motion.div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: ink(0.3) }}>{label}</div>
    </div>
  );
};

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose, navigate, canHover }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
        exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        transition={{ duration: 0.4, ease: EASE_EXPO }}
        className="lg:hidden fixed inset-0 z-99 flex flex-col pt-24 overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-menu)' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col px-6 sm:px-8 pt-8 gap-1">
          {NAV_LINKS.map(({ href, label }, i) => (
            <motion.a
              key={href}
              href={href}
              onClick={onClose}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: EASE_EXPO }}
              className="text-[15vw] xs:text-6xl sm:text-5xl font-black uppercase tracking-tighter transition-colors py-3 border-b"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: ink(0.2), borderColor: ink(0.05) }}
              onMouseEnter={e => { if (canHover) e.currentTarget.style.color = THEME.accent; }}
              onMouseLeave={e => { e.currentTarget.style.color = ink(0.2); }}
            >{label}</motion.a>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
          className="px-6 sm:px-8 mt-auto pb-12 flex flex-col gap-3"
        >
          <button
            type="button"
            onClick={() => { navigate('/login'); onClose(); }}
            className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all"
            style={{ color: ink(0.5), borderColor: ink(0.1) }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { navigate('/register'); onClose(); }}
            className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all"
            style={{ backgroundColor: THEME.accent, color: '#0a1000' }}
          >
            Join the Lab
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, num, index, canHover }) => {
  const [hovered, setHovered] = useState(false);
  const active = canHover && hovered;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: Math.min(index, 5) * 0.08, ease: EASE_EXPO }}
      onMouseEnter={() => canHover && setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="relative group rounded-2xl p-6 sm:p-7 lg:p-8 overflow-hidden cursor-default transition-all duration-500 border"
      style={{
        backgroundColor: THEME.bgSecondary,
        borderColor: active ? accentAlpha(30) : ink(0.06),
      }}
    >
      <motion.div
        animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.8 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accentAlpha(8)}, ${accentAlpha(3)}, transparent)` }}
      />
      <div
        className="absolute top-4 right-5 text-[44px] sm:text-[60px] font-black leading-none select-none pointer-events-none"
        style={{ fontFamily: "'Bebas Neue', sans-serif", color: ink(0.05) }}
      >{num}</div>
      <div className="relative z-10">
        <motion.div
          animate={{ backgroundColor: active ? THEME.accent : ink(0.05), color: active ? '#000' : ink(0.5) }}
          transition={{ duration: 0.3 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 sm:mb-7"
        >
          <Icon name={icon} className="text-xl" />
        </motion.div>
        <h3
          className="font-black mb-3 uppercase"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.02em', color: THEME.textStrong }}
        >{title}</h3>
        <p className="leading-relaxed text-sm font-medium" style={{ color: ink(0.4) }}>{desc}</p>
      </div>
    </motion.div>
  );
};

// ─── Pricing Card ─────────────────────────────────────────────────────────────
const PricingCard = ({ plan, navigate, isAuthenticated = false }) => {
  const { popular, planId, ctaLabel, ctaDest, features } = plan;

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate(buildPlansPath({ planId, tab: ctaDest }));
    } else {
      const redirect = buildPlansPath({ planId, tab: ctaDest });
      navigate(`/register?redirect=${encodeURIComponent(redirect)}`);
    }
  };

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden h-full"
      style={{
        border: popular ? `1px solid ${THEME.accent}` : `1px solid ${ink(0.08)}`,
        boxShadow: popular ? `0 0 60px -10px ${accentAlpha(25)}` : 'none',
      }}
    >
      {popular && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)` }} />
      )}
      <div
        className="p-6 sm:p-7 lg:p-8 flex flex-col grow"
        style={{ backgroundColor: popular ? accentAlpha(8) : THEME.bgSecondary }}
      >
        {popular && (
          <span
            className="self-start mb-5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
            style={{ backgroundColor: THEME.accent, color: '#000' }}
          >
            Most Popular
          </span>
        )}
        <div className="mb-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: ink(0.3) }}>{plan.name}</p>
          <div className="flex items-end gap-1">
            <span
              className="font-black leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.75rem,8vw,4rem)', color: THEME.textStrong }}
            >{plan.price}</span>
            {plan.per && <span className="text-sm font-bold mb-2" style={{ color: ink(0.3) }}>{plan.per}</span>}
          </div>
        </div>
        <div className="h-px my-6" style={{ backgroundColor: ink(0.05) }} />
        <ul className="space-y-3.5 mb-8 grow">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm font-medium">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: accentAlpha(15) }}
              >
                <Icon name="check" className="text-[11px]" />
              </div>
              <span style={{ color: ink(0.55) }}>{f}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleCTA}
          className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={
            popular
              ? { backgroundColor: THEME.accent, color: '#000' }
              : { backgroundColor: ink(0.05), color: ink(0.7), border: `1px solid ${ink(0.1)}` }
          }
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

// MAIN
const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const canHover = useCanHover();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Replace with your real auth check
  const isAuthenticated = false;
  // isDark is still read from context, but ONLY for the one thing that truly
  // needs a JS branch: the hero photo's filter. Everything else below is
  // driven by CSS variables and never re-renders on theme change.
  const { isDark } = useTheme();

  // navInk: while unscrolled, the navbar sits transparently on the hero photo
  // and needs literal white text regardless of theme; once scrolled it uses
  // the normal theme ink() (which itself is theme-invariant as a string).
  const navInk = useCallback((alpha) => (scrolled ? ink(alpha) : `rgba(255,255,255,${alpha})`), [scrolled]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prevOverflow; };
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleHeroCTA = () => {
    if (isAuthenticated) navigate(buildPlansPath({ tab: 'explore' }));
    else navigate('/register');
  };

  const handleBottomCTA = () => {
    if (isAuthenticated) navigate(buildPlansPath({ tab: 'find' }));
    else navigate('/register');
  };

  return (
    <>
      {/* Static — created once at module load, never re-injected on theme change */}
      <style>{LANDING_STYLES}</style>

      <div className="grain dm w-screen min-h-screen bg-(--bg) text-(--text) overflow-x-hidden">
        <CursorGlow enabled={canHover && !prefersReducedMotion} />

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <motion.nav
          animate={{ borderBottomColor: scrolled ? THEME.border : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)', backgroundColor: scrolled ? THEME.navBg : 'transparent' }}
          transition={{ duration: 0.4 }}
          className="fixed top-0 left-0 right-0 z-100 border-b border-transparent"
        >
          <div className="max-w-360 mx-auto px-4 sm:px-8 h-16 sm:h-20 flex justify-between items-center">
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 sm:gap-3"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: THEME.accent, boxShadow: `0 0 20px ${THEME.shadow}` }}>
                <Icon name="pulse_alert" className="text-[#0a1000] text-lg" />
              </div>
              <span className="bebas text-xl sm:text-2xl tracking-wider" style={{ color: navInk(1) }}>Vitalis</span>
            </motion.button>

            <div className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map(({ href, label }, i) => (
                <motion.a
                  key={href} href={href}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-[11px] font-bold transition-colors tracking-[0.2em] uppercase relative group"
                  style={{ color: navInk(0.65) }}
                  onMouseEnter={e => { if (canHover) e.currentTarget.style.color = THEME.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.color = navInk(0.65); }}
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-(--accent) group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
              <ThemeToggle />
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => navigate('/login')}
                className="hidden sm:block text-[11px] font-bold uppercase tracking-widest transition-colors"
                style={{ color: navInk(0.75) }}
              >Sign In</motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
                onClick={() => navigate('/register')}
                className="hidden sm:block px-5 lg:px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: THEME.accent, color: '#000', boxShadow: `0 0 30px ${THEME.shadow}` }}
              >Join the Lab</motion.button>
              <button
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="lg:hidden flex flex-col gap-1.5 w-10 h-10 justify-center items-center rounded-xl transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }} className="w-5 h-0.5 block origin-center" style={{ backgroundColor: navInk(1) }} />
                <motion.span animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }} className="w-5 h-0.5 block" style={{ backgroundColor: navInk(1) }} />
                <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }} className="w-5 h-0.5 block origin-center" style={{ backgroundColor: navInk(1) }} />
              </button>
            </div>
          </div>
        </motion.nav>

        <div id="mobile-menu">
          <MobileMenu open={menuOpen} onClose={closeMenu} navigate={navigate} canHover={canHover} />
        </div>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="hero-min-h relative flex flex-col justify-end pb-14 sm:pb-24 pt-20 overflow-hidden">
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            <img
              src={GYM_BG_FALLBACK}
              srcSet={GYM_BG_SRCSET}
              sizes="100vw"
              alt=""
              aria-hidden
              fetchpriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center"
              style={{ filter: isDark ? 'brightness(0.2) saturate(0.7)' : 'brightness(0.8) saturate(0.5)' }}
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${bgAlpha(50)} 0%, ${bgAlpha(20)} 40%, var(--bg) 100%)` }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${bgAlpha(70)} 0%, transparent 60%)` }} />
            <div className="absolute inset-0 scanline opacity-40" />
          </motion.div>
          <div className="absolute top-20 left-[10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" style={{ backgroundColor: accentAlpha(9) }} />
          <div className="absolute bottom-0 right-[5%] w-[240px] sm:w-[400px] h-[240px] sm:h-[400px] rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" style={{ backgroundColor: accentAlpha(15) }} />

          <motion.div className="relative z-10 max-w-360 mx-auto w-full px-5 sm:px-8" style={{ opacity: heroOpacity }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex items-center gap-3 mb-8 sm:mb-12">
              <div className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-full border backdrop-blur-sm" style={{ borderColor: ink(0.1), backgroundColor: ink(0.05) }}>
                <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                  <span className="pulse-ring absolute inline-block w-2 h-2 rounded-full" style={{ backgroundColor: accentAlpha(50) }} />
                  <span className="relative w-1.5 h-1.5 rounded-full" style={{ backgroundColor: THEME.accent, boxShadow: `0 0 8px ${THEME.accent}` }} />
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em]" style={{ color: ink(0.5) }}>Institutional Grade Biometrics</span>
              </div>
            </motion.div>

            <div className="hero-text overflow-hidden mb-6 sm:mb-10">
              {['BEYOND', 'FITNESS.'].map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.4 + i * 0.12, ease: EASE_EXPO }}
                  className={i === 1 ? 'italic' : ''}
                  style={{ color: i === 1 ? ink(0.15) : THEME.text }}
                >{word}</motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75 }} className="flex flex-col gap-8 max-w-lg">
              <p className="text-base sm:text-lg leading-relaxed font-medium" style={{ color: ink(0.45) }}>
                Vitalis is a high-performance OS for the human body. We bridge the gap between clinical data and daily action.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleHeroCTA}
                  className="flex-1 sm:flex-none px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] transition-all hover:-translate-y-1 active:translate-y-0 whitespace-nowrap text-center"
                  style={{ backgroundColor: THEME.accent, color: '#0a1000', boxShadow: `0 20px 50px ${THEME.shadow}` }}
                >
                  Initiate Protocol
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl border transition-all group whitespace-nowrap"
                  style={{ borderColor: ink(0.1), color: ink(0.45) }}
                  onMouseEnter={e => { if (canHover) { e.currentTarget.style.borderColor = ink(0.25); e.currentTarget.style.color = THEME.text; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.1); e.currentTarget.style.color = ink(0.45); }}
                >
                  <Icon name="play_circle" className="text-2xl transition-colors shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Watch Film</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[30, 50, 70].map((pct, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border"
                      style={{ borderColor: THEME.bg, backgroundColor: accentAlpha(pct) }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium" style={{ color: ink(0.3) }}>
                  Joined by <span style={{ color: ink(0.55), fontWeight: 700 }}>50K+</span> athletes worldwide
                </span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: ink(0.25) }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-px h-8" style={{ background: `linear-gradient(to bottom, ${ink(0.25)}, transparent)` }}
            />
          </motion.div>
        </section>

        {/* ── Marquee ────────────────────────────────────────────────────── */}
        <Marquee />

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section className="py-14 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: THEME.bg }}>
          <div className="max-w-360 mx-auto">
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 border rounded-2xl p-6 sm:p-12 relative overflow-hidden"
              style={{ borderColor: ink(0.05), backgroundColor: THEME.bgSecondary }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${accentAlpha(8)}, transparent)` }} />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accentAlpha(40)}, transparent)` }} />
              {ABOUT_STATS.map((s) => <StatCounter key={s.label} {...s} />)}
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────── */}
        <section id="features" className="py-14 sm:py-24 lg:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: THEME.bg }}>
          <div className="section-num absolute -top-4 -left-4 select-none pointer-events-none">FEAT</div>
          <div className="max-w-360 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8">
              <div>
                <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.accent }}>The Infrastructure</motion.p>
                <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: EASE_EXPO }}
                  className="bebas leading-none" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', letterSpacing: '0.01em', color: THEME.textStrong }}
                >Engineered for<br /><span style={{ color: ink(0.15) }}>The 1%.</span></motion.h2>
              </div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-xs text-sm font-medium leading-relaxed border-l-2 pl-6"
                style={{ color: ink(0.3), borderColor: accentAlpha(30) }}
              >Our proprietary models are trained on over 2 million athletic data points to provide accuracy where others guess.</motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} canHover={canHover} />)}
            </div>
          </div>
        </section>

        {/* ── About ──────────────────────────────────────────────────────── */}
        <section id="about" className="py-14 sm:py-24 lg:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: THEME.bgAlt }}>
          <div className="section-num absolute -top-4 right-0 select-none pointer-events-none">ABOT</div>
          <div className="max-w-360 mx-auto">
            <div className="text-center mb-14 sm:mb-24">
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.accent }}>Our Story</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                className="bebas leading-none mb-6" style={{ fontSize: 'clamp(2.5rem, 9vw, 7rem)', letterSpacing: '0.01em', color: THEME.textStrong }}
              >Redefining Human <span className="glow-text" style={{ color: THEME.accent }}>Performance</span></motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-medium" style={{ color: ink(0.35) }}
              >Vitalis was born from a simple question: What if technology could truly understand human biology and help us perform at our peak, every single day?</motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-16 sm:mb-24">
              {[
                { icon: 'rocket_launch', title: 'Our Mission', body: 'To democratize elite-level performance optimization by making clinical-grade biometric intelligence accessible to everyone, not just professional athletes.' },
                { icon: 'visibility',    title: 'Our Vision',  body: 'A world where every person has the tools and insights to understand their body, optimize their health, and unlock their full potential.' },
              ].map((item, i) => (
                <motion.div
                  key={item.title} initial={{ opacity: 0, x: i === 0 ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                  className="group relative rounded-2xl p-7 sm:p-10 overflow-hidden border transition-colors"
                  style={{ backgroundColor: THEME.bgSecondary, borderColor: ink(0.06) }}
                  onMouseEnter={e => { if (canHover) e.currentTarget.style.borderColor = accentAlpha(20); }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.06); }}
                >
                  <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: accentAlpha(4) }} />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: accentAlpha(10) }}>
                    <Icon name={item.icon} className="text-2xl" />
                  </div>
                  <h3 className="bebas text-3xl sm:text-4xl mb-4 tracking-wide" style={{ color: THEME.textStrong }}>{item.title}</h3>
                  <p className="leading-relaxed text-sm sm:text-base" style={{ color: ink(0.4) }}>{item.body}</p>
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-center" style={{ color: THEME.accent }}>What We Believe</motion.p>
            <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bebas text-center mb-10 sm:mb-16" style={{ fontSize: 'clamp(2.25rem, 6vw, 5rem)', color: THEME.textStrong }}>Core Values</motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ABOUT_VALUES.map((v, i) => (
                <motion.div
                  key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group rounded-2xl p-6 border transition-all duration-300"
                  style={{ backgroundColor: ink(0.03), borderColor: ink(0.05) }}
                  onMouseEnter={e => { if (canHover) { e.currentTarget.style.borderColor = accentAlpha(25); e.currentTarget.style.backgroundColor = ink(0.05); } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ink(0.05); e.currentTarget.style.backgroundColor = ink(0.03); }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: accentAlpha(10) }}>
                    <Icon name={v.icon} className="text-lg" />
                  </div>
                  <h4 className="font-black text-base mb-2 dm" style={{ color: THEME.textStrong }}>{v.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: ink(0.35) }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-14 sm:py-24 lg:py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: THEME.bg }}>
          <div className="section-num absolute -top-4 -left-4 select-none pointer-events-none">PRCE</div>
          <div className="max-w-360 mx-auto">
            <div className="text-center mb-14 sm:mb-20">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: THEME.accent }}>Plans</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_EXPO }}
                className="bebas mb-4" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', color: THEME.textStrong }}
              >Access the Lab.</motion.h2>
              <p className="max-w-sm mx-auto text-sm font-medium" style={{ color: ink(0.35) }}>Transparent pricing for lifelong optimization.</p>
            </div>

            <div className="md:hidden">
              <HorizontalSlider
                items={PRICING}
                itemWidth="w-[80vw] max-w-[320px]"
                canHover={canHover}
                renderItem={(plan) => (
                  <PricingCard plan={plan} navigate={navigate} isAuthenticated={isAuthenticated} />
                )}
              />
            </div>
            <div className="hidden md:grid grid-cols-3 gap-5 max-w-5xl mx-auto">
              {PRICING.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.7, delay: i * 0.1, ease: EASE_EXPO }}>
                  <PricingCard plan={plan} navigate={navigate} isAuthenticated={isAuthenticated} />
                </motion.div>
              ))}
            </div>

            <p className="text-center text-[11px] uppercase tracking-widest mt-10 font-bold" style={{ color: ink(0.2) }}>
              No contracts · Cancel anytime · 30-day money-back guarantee
            </p>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────────────── */}
        <section className="py-14 sm:py-24 px-5 sm:px-8" style={{ backgroundColor: THEME.bg }}>
          <div className="max-w-360 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE_EXPO }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl px-6 sm:px-14 py-12 sm:py-20"
              style={{ backgroundColor: THEME.accent }}
            >
              <div className="absolute -right-8 -bottom-8 bebas text-[80px] sm:text-[200px] text-black/9 leading-none select-none pointer-events-none">EVOLVE</div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-black/40 mb-3">Start Today</p>
                  <h2 className="bebas text-black leading-none mb-4" style={{ fontSize: 'clamp(2.25rem, 7vw, 5.5rem)' }}>Ready to Evolve?</h2>
                  <p className="text-black/50 text-sm font-medium max-w-xs">Join 50,000+ athletes already training with clinical-grade intelligence.</p>
                </div>
                <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleBottomCTA}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.03] transition-transform shadow-xl whitespace-nowrap"
                  >
                    Secure Membership
                  </button>
                  <p className="text-[10px] text-black/35 font-bold text-center uppercase tracking-wider">Free plan available</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t" style={{ borderColor: ink(0.05), backgroundColor: THEME.bgFooter }}>
          <div className="max-w-360 mx-auto px-5 sm:px-8">

            <div className="py-12 sm:py-14 flex flex-col sm:flex-row sm:items-start justify-between gap-8 sm:gap-10">

              <div className="max-w-[260px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME.accent, boxShadow: `0 0 16px ${accentAlpha(25)}` }}>
                    <Icon name="pulse_alert" className="text-[#0a1000] text-base" />
                  </div>
                  <span className="bebas text-2xl tracking-wider" style={{ color: THEME.textStrong }}>Vitalis</span>
                </div>
                <p className="text-sm leading-relaxed font-medium mb-6" style={{ color: ink(0.2) }}>
                  The world's most advanced human performance platform.
                </p>
                <div className="flex items-center gap-2">
                  {[{ icon: 'alternate_email', label: 'Twitter/X' }, { icon: 'camera_alt', label: 'Instagram' }, { icon: 'work', label: 'LinkedIn' }].map(({ icon, label }) => (
                    <a
                      key={label} href="#" aria-label={label}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-300 group"
                      style={{ backgroundColor: ink(0.05), borderColor: ink(0.08) }}
                      onMouseEnter={e => { if (canHover) { e.currentTarget.style.backgroundColor = THEME.accent; e.currentTarget.style.borderColor = THEME.accent; } }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ink(0.05); e.currentTarget.style.borderColor = ink(0.08); }}
                    >
                      <Icon name={icon} className="text-base" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex gap-10 sm:gap-16">
                {[
                  { heading: 'Product', links: ['Features', 'Pricing'] },
                  { heading: 'Company', links: ['About', 'Contact'] },
                ].map(({ heading, links }) => (
                  <div key={heading}>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: ink(0.25) }}>{heading}</h4>
                    <ul className="flex flex-col gap-2.5">
                      {links.map(link => (
                        <li key={link}>
                          <a
                            href="#"
                            className="text-[12px] font-medium transition-colors"
                            style={{ color: ink(0.3) }}
                            onMouseEnter={e => { if (canHover) e.currentTarget.style.color = THEME.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.color = ink(0.3); }}
                          >{link}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: ink(0.05) }} />

            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-[11px] font-medium tracking-wide" style={{ color: ink(0.2) }}>
                © 2026 <span className="font-bold" style={{ color: ink(0.35) }}>Vitalis Labs Inc.</span> All rights reserved.
              </p>
              <p className="text-[11px] font-medium tracking-wide" style={{ color: ink(0.2) }}>
                Developed by <span className="font-bold" style={{ color: ink(0.35) }}>STC Students</span>
              </p>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
};

export default Landing;